import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { ethers } from 'ethers';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button } from 'react-bootstrap';

// Components
import Navigation from './Navigation';
import Loading from './Loading';
// Config: Network configuration
import config from '../config.json';

// ABIs: Contract ABIs here
import TOKEN_ABI from '../abis/ThetaCollectibles.json';

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);
  const [birthdate, setBirthdate] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = ethers.utils.getAddress(accounts[0]);
    setAccount(account);

    const balance = await provider.getBalance(account);
    setBalance(ethers.utils.formatUnits(balance, 18));
    setIsLoading(false);
  };



  useEffect(() => {
    if (isLoading) {
      loadBlockchainData();
    }
  }, [isLoading]);

  const handleMint = async () => {
    if (!window.ethereum) {
      alert("Lütfen MetaMask'ı kurun.");
      return;
    }

    if (!birthdate) {
      alert("Lütfen doğum tarihinizi girin.");
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();


    try {
      const contractAddress = config.contractAddress;
      const contract = new ethers.Contract(contractAddress, TOKEN_ABI.abi, signer);


      const mintPrice = ethers.utils.parseEther("0.0011");
      const stringToConvert = "https://brown-impressive-ptarmigan-546.mypinata.cloud/ipfs/QmVQMZmoffk1FMvipFZWiUD7aG9buvoGNMEUHQ5BMLejYk";
      const bytes32Hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(stringToConvert));

      await contract.getMinterRole()


      const tx = await contract.mintTheta(bytes32Hash, { value: mintPrice , gasLimit: 1000000 });
      setStatus("İşlem gönderildi: " + tx.hash);
      console.log("İşlem gönderildi: ", tx.hash);
      await tx.wait();
      setStatus("Minting tamamlandı!");
      console.log("Minting tamamlandı!");
    } catch (error) {
      console.error(error);
      setStatus("Hata: " + error.message);
    }
  };

  return (
    <Container>
      <Navigation account={account} />

      <h1 className='my-4 text-center'>Theta Koleksiyonları</h1>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <p className='text-center'><strong>Hesabınız</strong> {balance} ETH</p>
          <Form>
            <Form.Group className="mb-3" controlId="formBirthdate">
              <Form.Label>Doğum Tarihi</Form.Label>
              <Form.Control 
                type="date" 
                value={birthdate} 
                onChange={(e) => setBirthdate(e.target.value)} 
                placeholder="Doğum tarihinizi girin" 
              />
            </Form.Group>
            <Button variant="primary" onClick={handleMint}>
              NFT Mintle
            </Button>
          </Form>
          <p className='text-center'>{status}</p>
        </>
      )}
    </Container>
  );
}

export default App;
