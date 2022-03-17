import { useAddress, useMetamask } from '@thirdweb-dev/react';
import type { NextPage } from 'next';

const Home: NextPage = () => {
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  return (
    <div>
      {address ? (
        <p>Your address is {address}</p>
      ) : (
        <button onClick={connectWithMetamask}>Connect with Metamask</button>
      )}
    </div>
  );
};

export default Home;
