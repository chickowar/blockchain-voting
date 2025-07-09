import React, { createContext, useState, useContext } from "react";

// Создаем контекст
const AppContext = createContext();

// Хук для использования контекста
export const useAppContext = () => useContext(AppContext);

// Провайдер для контекста
export const AppProvider = ({ children }) => {
    // Состояние для signer, provider, contract и voteIdString
    const [signer, setSigner] = useState(null);
    const [provider, setProvider] = useState(null);
    const [contract, setContract] = useState(null);
    const [votingContract, setVotingContract] = useState(null);
    const [voteIdString, setVoteIdString] = useState("");

    return (
        <AppContext.Provider
            value={{
                signer,
                setSigner,
                provider,
                setProvider,
                contract,
                setContract,
                votingContract,
                setVotingContract,
                voteIdString,
                setVoteIdString
            }}
        >
            {children}
        </AppContext.Provider>
    );
};
