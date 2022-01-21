import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import Web3 from "web3";
import { Contract } from "web3-eth-contract";

import tokenABI from "../contracts/abis/MAIToken.json";
import ethSwapABI from "../contracts/abis/ETHSwapContract.json";
import bscSwapABI from "../contracts/abis/BSCSwapContract.json";

import { config } from "../config";
import useAuth from "../hooks/useAuth";
import { useSnackbar } from "./Snackbar";

interface Contracts {
  tokenContract?: Contract;
  ethSwapContract?: Contract;
  bscSwapContract?: Contract;
}
interface Web3ContextValue {
  web3?: Web3;
  contracts: Contracts;
  wrongNetwork: boolean;
}

export const Web3Context = createContext<Web3ContextValue>({
  wrongNetwork: false,
  contracts: {},
});

export const Web3Provider = ({ children }: PropsWithChildren<any>) => {
  const { web3, chainId } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [wrongNetwork, setWrongNetwork] = useState(false);

  const [contracts, setContracts] = useState<Contracts>({});

  useEffect(() => {
    if (!chainId) {
      return;
    }
    const chainIdInt = parseInt(chainId);
    if (![1, 4, 56, 97].includes(chainIdInt)) {
      showSnackbar({
        severity: "error",
        message: "Wrong network",
      });
      setWrongNetwork(true);
      return;
    }
    setWrongNetwork(false);

    let contractAddress;
    if (chainIdInt === 1) {
      contractAddress = config.ERC20ContractAddress.MAINNET;
    } else if (chainIdInt === 4) {
      contractAddress = config.ERC20ContractAddress.RINKEBY;
    } else if (chainIdInt === 56) {
      contractAddress = config.BEP20ContractAddress.MAINNET;
    } else if (chainIdInt === 97) {
      contractAddress = config.BEP20ContractAddress.TESTNET;
    }

    const tokenContract = new web3.eth.Contract(
      tokenABI as any,
      contractAddress
    );

    const isMainnet = chainIdInt === 1 || chainIdInt === 56;

    const ethSwapContract = new web3.eth.Contract(
      ethSwapABI as any,
      isMainnet
        ? config.ETHSwapContractAddress.MAINNET
        : config.ETHSwapContractAddress.RINKEBY
    );

    const bscSwapContract = new web3.eth.Contract(
      bscSwapABI as any,
      isMainnet
        ? config.BSCSwapContractAddress.MAINNET
        : config.BSCSwapContractAddress.TESTNET
    );

    setContracts({
      tokenContract,
      ethSwapContract,
      bscSwapContract,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

  return (
    <Web3Context.Provider value={{ web3, contracts, wrongNetwork }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useContracts = () => useContext(Web3Context);
