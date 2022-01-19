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
//   const [web3, setWeb3] = useState<Web3>();

  const [contracts, setContracts] = useState<Contracts>({});

  useEffect(() => {
    if (!chainId) {
      return;
    }
    if (parseInt(chainId) !== 1 && parseInt(chainId) !== 56) {
      showSnackbar({
        severity: "error",
        message: "Wrong network",
      });
      setWrongNetwork(true);
      return;
    }
    setWrongNetwork(false);

    const instance = new Web3(
      parseInt(chainId) === 1 ? config.ETH_Network_RPC : config.BSC_Network_RPC
    );
    instance.eth.setProvider(web3.currentProvider);
    // setWeb3(instance);

    const tokenContract = new web3.eth.Contract(
      tokenABI as any,
      parseInt(chainId) === 1
        ? config.ERC20ContractAddress
        : config.BEP20ContractAddress
    );

    const ethSwapContract = new web3.eth.Contract(
      ethSwapABI as any,
      config.ETHSwapContractAddress
    );

    const bscSwapContract = new web3.eth.Contract(
      bscSwapABI as any,
      config.BSCSwapContractAddress
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
