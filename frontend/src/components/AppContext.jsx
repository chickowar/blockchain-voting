import React, { createContext, useState, useContext, useEffect } from "react";
import { getProviderSignerVotingContract } from "../assets/voting_config.js";

const AppContext = createContext({}); // Default value doesn't matter since we wrap whole app

export const useAppContext = () => useContext(AppContext); // TODO: fix???

export const AppProvider = ({ children }) => {
    const [signer, setSigner] = useState(null);
    const [provider, setProvider] = useState(null);
    const [votingContract, setVotingContract] = useState(null);
    const [voteIdString, setVoteIdString] = useState(
        localStorage.getItem("votingId") || ""
    );
    const [identityCommitment, setIdentityCommitment] = useState(
        localStorage.getItem("identityCommitment") || ""
    );


    // Sync voteIdString to localStorage
    useEffect(() => {
        if (voteIdString) {
            localStorage.setItem("votingId", voteIdString);
        } else {
            localStorage.removeItem("votingId");
        }
    }, [voteIdString]);


    // Sync identityCommitment to localStorage
    useEffect(() => {
        if (identityCommitment) {
            localStorage.setItem("identityCommitment", identityCommitment);
        } else {
            localStorage.removeItem("identityCommitment");
        }
    }, [identityCommitment]);

    // Rehydrate provider/signer/contract if user was connected before
    useEffect(() => {
        const initialize = async () => {
            if (localStorage.getItem("isConnected") === "true" && window.ethereum) {
                try {
                    const { provider, signer, votingContract } = await getProviderSignerVotingContract();
                    setProvider(provider);
                    setSigner(signer);
                    setVotingContract(votingContract);
                    console.log("🔄 Restored provider, signer, contract from localStorage");
                } catch (err) {
                    console.error("❌ Failed to restore provider/signer/contract:", err);
                    localStorage.removeItem("isConnected"); // fallback: clear flag
                }
            }
        };

        initialize();
    }, []);


    if (import.meta.env.DEV || process.env.NODE_ENV === "development") {
        window.getAppContext = () => ({
            signer,
            provider,
            votingContract,
            voteIdString,
            identityCommitment,
        });
    }

    return (
        <AppContext.Provider
            value={{
                signer, setSigner,
                provider, setProvider,
                votingContract, setVotingContract,
                voteIdString, setVoteIdString,
                identityCommitment, setIdentityCommitment
            }}
        >
            {children}
        </AppContext.Provider>
    );
};


