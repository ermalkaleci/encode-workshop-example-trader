# Sample Price Reader

A basic Chopsticks and EVM+ use case. Just a simple contract that uses Oracle Gatway to read token prices and Chopsticks feature to mock storage.

```shell
yarn install
yarn build
# start an Acala fork node using Chopsticks
npx @acala-network/chopsticks@latest dev --config=https://raw.githubusercontent.com/AcalaNetwork/chopsticks/master/configs/acala.yml
# deploy script and run tests
yarn deploy
```
