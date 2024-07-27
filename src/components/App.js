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
  const [nftImage, setNftImage] = useState(null);
  const [contract, setContract] = useState(null); // Add contract state

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
    // Sözleşme oluşturulduktan sonra olayı dinleyin
    if (contract) {
      contract.on('NFTDroppedToOldUser', (oldUser, tokenId) => {
        console.log(`Eski kullanıcıya NFT bırakıldı: ${oldUser}, Token ID: ${tokenId}`);
        // Bu bilgiyi ihtiyacınıza göre UI'nizde gösterin
      });
    }

    // Clean up the event listener when the component unmounts or when contract changes
    return () => {
      if (contract) {
        contract.removeAllListeners('NFTDroppedToOldUser');
      }
    };
  }, [contract]);



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
    
      const response = await fetch(`https://brown-impressive-ptarmigan-546.mypinata.cloud/ipfs/QmW6m9KWUe84zZkyWMrXBDfJXSyWPsfd3VEA8qLJ3gGu2J`);
      const metadata = await response.json();
      setNftImage(metadata.image); // Metadata'dan görsel URL'sini al
    } catch (error) {
      console.error(error);
      setStatus("Hata: " + error.message);
    }
  };

  return (
    <Container>
      <Navigation account={account} />

      <h2 className='my-4 text-center'>Mintbox for Astrology timecharts living on-chain</h2>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <p className='text-center'><strong>Account</strong> {balance} ETH</p>
          <Form>
            <Form.Group className="mb-3" controlId="formBirthdate">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control 
                type="date" 
                value={birthdate} 
                onChange={(e) => setBirthdate(e.target.value)} 
                placeholder="Please enter your date of birh : " 
              />
            </Form.Group>
            <Button variant="primary" onClick={handleMint}>
             Mint NFT
            </Button>
          </Form>
          <p className='text-center'>{status}</p>
          {nftImage && (
          <div className='text-center'>
            <h3>YOUR NFT!</h3>
            <h4>Congratulations</h4>
            <img src={nftImage} alt="NFT" style={{ width: '300px', height: 'auto' }} />
          </div>
        )}
        </>
      )}
    </Container>
  );
}

export default App;
