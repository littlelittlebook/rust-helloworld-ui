import "regenerator-runtime/runtime";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Big from "big.js";
import Form from "./components/Form";

const BOATLOAD_OF_GAS = Big(3).times(10 ** 13).toFixed();

const App = ({ contract, currentUser, nearConfig, wallet }) => {
  const [status, setStatus] = useState(null);

  useEffect(async () => {
    if (currentUser) {
      const status = await contract.get_helloworld({
        account_id: currentUser.accountId
      });

      setStatus(status);
    }
  });

  const onSubmit = async event => {
    event.preventDefault();

    const { fieldset, message } = event.target.elements;
    fieldset.disabled = true;

    await contract.helloworld(
      {
        message: message.value,
        account_id: currentUser.accountId
      },
      BOATLOAD_OF_GAS
    );

    const status = await contract.get_helloworld({
      account_id: currentUser.accountId
    });

    setStatus(status);

    message.value = "";
    fieldset.disabled = false;
    message.focus();
  };

  const signIn = () => {
    wallet.requestSignIn(
      nearConfig.contractName,
      "NEAR HelloWorld"
    );
  };

  const signOut = () => {
    wallet.signOut();
    window.location.replace(window.location.origin + window.location.pathname);
  };

  return (
    <main>
      <header>
        <h1>Near hello world</h1>

        {currentUser ?
          <p>Currently signed in as: <code>{currentUser.accountId}</code></p>
        :
          <p>say hello world! Please login to continue.</p>
        }

        { currentUser
          ? <button onClick={signOut}>Log out</button>
          : <button onClick={signIn}>Log in</button>
        }
      </header>

      {currentUser &&
        <Form
          onSubmit={onSubmit}
          currentUser={currentUser}
        />
      }

      {status ?
        <>
          <p>reply:</p>
          <p>
            <code>
              {status}
            </code>
          </p>
        </>
      :
        <p>No status message yet!</p>
      }
    </main>
  );
};

App.propTypes = {
  contract: PropTypes.shape({
    helloworld: PropTypes.func.isRequired,
    get_helloworld: PropTypes.func.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({
    accountId: PropTypes.string.isRequired,
    balance: PropTypes.string.isRequired
  }),
  nearConfig: PropTypes.shape({
    contractName: PropTypes.string.isRequired
  }).isRequired,
  wallet: PropTypes.shape({
    requestSignIn: PropTypes.func.isRequired,
    signOut: PropTypes.func.isRequired
  }).isRequired
};

export default App;
