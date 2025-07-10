import { ethers } from "ethers";
import { Identity } from "@semaphore-protocol/identity";
import { Group }    from "@semaphore-protocol/group";
import {
    generateProof
} from "@semaphore-protocol/proof";

function packToSolidityProof(proof) {
    // proof.points — массив из восьми координат [Ax, Ay, Bx0, Bx1, By0, By1, Cx, Cy]
    const p = proof.points.map(x => BigInt(x));
    return [
        p[0], p[1],                  // A
        p[2], p[3], p[4], p[5],      // B
        p[6], p[7]                   // C
    ];
}

export async function loadIdentity(voteIdString, signer) {
    const sig = await signer.signMessage(`Generate Semaphore identity for ${voteIdString}`);
    return new Identity(sig);
}

export async function getIdentityCommitment(voteIdString, setIdentityCommitment, signer) {
    console.log("VoteId bytes32:", ethers.encodeBytes32String(voteIdString));
    const identity = await loadIdentity(voteIdString, signer);
    const identityCommitment = BigInt(identity.commitment);  // это BigInt
    console.log("Identity Commitment:", identityCommitment);

    // Преобразуем BigInt в строку в шестнадцатеричной форме
    const identityCommitmentHex = ethers.toBeHex(identityCommitment, 32);

    console.log("Idenity Commitment Hex:", identityCommitmentHex);

    setIdentityCommitment(identityCommitmentHex);
}

export async function createVote(
    voteIdString,
    optionsCount,
    identityCommitments,
    votingDurationSec,
    votingContract,
) {
    console.log("typeof identityCommitments[0]:", typeof identityCommitments[0]);
    console.log("identityCommitments[0]:", identityCommitments[0]);
    // 1. Собираем Merkle-группу
    const group = new Group(identityCommitments.map(c => BigInt(c)));
    const merkleRoot = BigInt(group.root);
    const merkleRootBytes32 = ethers.zeroPadValue(ethers.toBeHex(merkleRoot), 32);

    // 2. Подготавливаем args
    const voteId    = ethers.encodeBytes32String(voteIdString);
    const nowSec    = Math.floor(Date.now() / 1000);
    const votingEnd = nowSec + votingDurationSec;

    const identityCommitmentsBytes32 = identityCommitments.map((c) =>
        ethers.zeroPadValue(c, 32) // ← это приведёт строку '0x...' к bytes32
    );

    // 3. Транзакция
    const tx = await votingContract.createVote(
        voteId,
        identityCommitmentsBytes32,
        optionsCount,
        votingEnd,
        merkleRootBytes32,
    );
    console.log("createVote tx:", tx.hash);
    await tx.wait();
    console.log("✅ Vote created");
}

export async function castVote(voteIdString, option, signer, votingContract) {
    console.log("Voting contract: ", votingContract);
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
    console.log("rawCommitments received from contract:", rawCommitments);
    // rawCommitments — Array<bytes32> → BigInt-массив:
    const commitments = rawCommitments.map(x => BigInt(String(x)));
    console.log("commitments received from contract:", commitments);

    // 2.3) Собираем Merkle-группу
    const group = new Group(commitments);

    // 2.4) Генерируем или восстанавливаем user’s Identity
    const identity = await loadIdentity(voteIdString, signer);

    // 2.5) External nullifier = hash(voteIdString)
    const externalNullifier = BigInt(
        ethers.keccak256(
            ethers.toUtf8Bytes(voteIdString)
        )
    );

    // 2.6) Генерируем ZK-пруф и nullifierHash
    const proof = await generateProof(
        identity,
        group,
        option,            // signal
        externalNullifier  // nullifier scope
    );

    const nullifierHash = BigInt(String(proof.nullifier));
    console.log("nullifierHash: ", nullifierHash);
    console.log("option: ", option);

    // вот здесь вызываем:
    console.log("Calling isValidProof")

    const valid = await votingContract.isValidProof(
        voteId,
        proof,
    );
    console.log("isValidProof: ", valid);

    if(valid) {
        const tx = await votingContract.vote(
            voteId,
            option,
            proof,
        );
        console.log("castVote tx:", tx.hash);
        await tx.wait();
        console.log("✅ Vote cast");
    } else {
        console.log("Invalid proof");
        throw new Error("Invalid proof");
    }
}

export async function getResults(voteIdString, votingContract) {
    if (!votingContract || typeof votingContract.getResults !== "function") {
        throw new Error(`votingContract isn't loaded`);
    }

    const voteId = ethers.encodeBytes32String(voteIdString);
    const results = await votingContract.getResults(voteId);
    console.log("results: ", results);
    return results;
}
