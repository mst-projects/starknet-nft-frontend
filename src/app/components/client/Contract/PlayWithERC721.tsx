import {
  useEffect,
  useState,
} from 'react';

import {
  Contract,
  InvokeFunctionResponse,
  shortString,
} from 'starknet';

import { erc721Abi } from '@/app/contracts/abis/ERC721abi';
import {
  Box,
  Button,
  Center,
  Spinner,
  Text,
} from '@chakra-ui/react';

import styles from '../../../page.module.css';
import { useStoreWallet } from '../../Wallet/walletContext';
import { useStoreBlock } from '../Block/blockContext';
import TransactionStatus from '../Transaction/TransactionStatus';

const contractAddress = "0x053e445549f9ccbb415531f39474ed5c696723f9233467e9033d9dafb5721b4a";

export default function PlayWithERC721() {
    // wallet context
    const providerSN = useStoreWallet(state => state.provider);
    const accountFromContext = useStoreWallet(state => state.account);

    // block context
    const blockFromContext = useStoreBlock(state => state.dataBlock);

    // Component context
    const [getName, setGetName] = useState<string>("default");
    const [value, setValue] = useState<number | null>(null);

    const [transactionHash, setTransactionHash] = useState<string>("");

    const erc721Contract = new Contract(erc721Abi, contractAddress, providerSN);
    if (accountFromContext) { erc721Contract.connect(accountFromContext); }

    useEffect(() => {
      accountFromContext && erc721Contract.get_name()
            .then((resp: bigint) => {
                console.log("resp =", resp)
                setGetName(shortString.decodeShortString(resp.toString()));
            })
            .catch((e: any) => { console.log("error get_name =", e) });
        return () => { }
    }
        , [blockFromContext.blockNumber]); // balance updated at each block


    function mint() {
        erc721Contract.mint(accountFromContext?.address, value)
            .then((resp: InvokeFunctionResponse) => {
                console.log("mint txH =", resp.transaction_hash)
                setTransactionHash(resp.transaction_hash);
            })
            .catch((e: any) => { console.log("error mint =", e) });
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(event.target.value, 10);
        if (!isNaN(newValue)) {
            setValue(newValue);
        } else {
            setValue(null);
        }
    };

    return (
        <>
            {
                !getName ? (
                    <Center>
                        <Spinner color="blue" size="sm" />  _Fetching data ...
                    </Center>
                ) : (
                    <>
                        
                        <div>
                            <Text className={styles.text1}>Balance = {getName} tokens</Text>
                            <Center>
                                <div>
                                    <input type="number" onChange={handleInputChange} />
                                    <p>{value !== null ? `Entered value: ${value}` : 'Please enter a number for tokenId'}</p>
                                </div>
                                <Button
                                    ml="4"
                                    textDecoration="none !important"
                                    outline="none !important"
                                    boxShadow="none !important"
                                    bg='green.100'
                                    onClick={() => {
                                        mint();
                                    }}
                                >
                                    mint
                                </Button>
                            </Center>
                        </div>
                        {!!transactionHash && (
                            <Box bg='green.200' color='black' borderWidth='1px' borderColor='green.800' borderRadius='md' p={1} marginTop={2}>
                                <Text className={styles.text1}>Last transaction status :</Text>
                                <TransactionStatus transactionHash={transactionHash}></TransactionStatus>
                            </Box>
                        )
                        }
                    </>
                )
            }
        </>
    )
}
