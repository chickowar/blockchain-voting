import { ethers } from "ethers";
import { Identity } from "@semaphore-protocol/identity";
import { Group }    from "@semaphore-protocol/group";
import {
    generateProof
} from "@semaphore-protocol/proof";

export async function loadIdentity(voteIdString, signer) {
    const sig = await signer.signMessage(`Generate Semaphore identity for ${voteIdString}`);
    return new Identity(sig);
}

export async function getIdentityCommitment(voteIdString, setIdentityCommitment, signer) {
    const identity = await loadIdentity(voteIdString, signer);
    const identityCommitment = identity.commitment;  // это BigInt
    console.log("Identity Commitment:", identityCommitment);

    // Преобразуем BigInt в строку в шестнадцатеричной форме
    const identityCommitmentHex = identityCommitment.toString(16);

    // Дополняем строку до 32 байт
    const identityCommitmentBytes32 = ethers.zeroPadValue(
        "0x" + identityCommitmentHex, 32
    );

    setIdentityCommitment(identityCommitmentBytes32);
}

export async function createVote(
    voteIdString,
    optionsCount,
    identityCommitments,
    votingDurationSec,
    votingContract,
) {
    // 1. Собираем Merkle-группу
    const group = new Group(identityCommitments.map(c => BigInt(c)));
    const merkleRoot = BigInt(group.root);

    // 2. Подготавливаем args
    const voteId    = ethers.encodeBytes32String(voteIdString);
    const nowSec    = Math.floor(Date.now() / 1000);
    const votingEnd = nowSec + votingDurationSec;

    // 3. Транзакция
    const tx = await votingContract.createVote(
        voteId,
        identityCommitments,
        optionsCount,
        votingEnd,
        merkleRoot
    );
    console.log("createVote tx:", tx.hash);
    await tx.wait();
    console.log("✅ Vote created");
}

async function castVote(voteIdString, option, votingContract) {
    const voteId = ethers.encodeBytes32String(voteIdString);

    // 2.1) Получаем Merkle-root, конец и число опций
    const [merkleRoot, votingEnd, optionsCount] =
        await votingContract.getGroup(voteId);

    console.log("merkleRoot: ", merkleRoot);
    console.log("votingEnd: ", votingEnd);
    console.log("optionsCount: ", optionsCount);

    if (option >= optionsCount) throw new Error("Bad option");

    // 2.2) Получаем список коммитментов из контракта
    const rawCommitments = await votingContract.getCommitments(voteId);
    // rawCommitments — Array<bytes32> → BigInt-массив:
    const commitments = rawCommitments.map(x => BigInt(x));

    // 2.3) Собираем Merkle-группу
    const group = new Group(commitments);

    // 2.4) Генерируем или восстанавливаем user’s Identity
    const identity = await loadIdentity(voteIdString);

    // 2.5) External nullifier = hash(voteIdString)
    const externalNullifier = BigInt(
        ethers.keccak256(
            ethers.toUtf8Bytes(voteIdString)
        )
    );

    // 2.6) Генерируем ZK-пруф и nullifierHash
    const { proof, nullifierHash } = await generateProof(
        identity,
        group,
        externalNullifier,
        option
    );

    // 2.7) Отправляем голос
    const tx = await votingContract.vote(
        voteId,
        BigInt(nullifierHash),
        option,
        proof
    );
    console.log("castVote tx:", tx.hash);
    await tx.wait();
    console.log("✅ Vote cast");
}
