ICO-COT
===============

COT token purchase system

Install
===============
1. nodejs
        curl --silent --location https://rpm.nodesource.com/setup_9.x | sudo bash -
	    yum -y install nodejs
2. gcc+
        yum install gcc-c++ make
3. truffle( this is solidity framework)
        npm install -g truffle
4. OpenZeppelin( this is contract package, already installed. Please install it if node_modules does not have this)
        cd "YOUR FOLDER PATH"
        npm install -E zeppelin-solidity
5. ganache( test tool, already installed. Please install it if node_modules does not have this)
        cd "YOUR FOLDER PATH"
        npm install ganache-cli -g
6. etherum-testrpc( test tool, already installed. Please install it if node_modules does not have this )
        cd "YOUR FOLDER PATH"
        npm install ethereumjs-testrpc
7. Go-lang
        yum install -y epel-release
	yum install -y golang gmp-devel git
8. Geth( test tool )( 64 bit)
        curl -o ~/go-etherum.tar.gz "https://gethstore.blob.core.windows.net/builds/geth-linux-amd64-1.7.3-4bb3c89d.tar.gz"
        tar zxvf go-etherum.tar.gz
        cp -R geth-linux-amd64-1.7.3-4bb3c89d/ go-ethereum/
        cp ~/go-ethereum/geth /usr/local/bin
        geth version


How To Run Project
===============
1. install Metamask in your browser
2. run private block chain in your dev
3. connect Metamask with private block chain
4. compile truffle contract
5. deploy compiled contract into private block chain
6. use Web3 and HTML to interactive with contract and Metamask


Run Private Blockchain( we have 3 different to build private blockchain)
===============
1. version 1, use testrpc
        testrpc -m "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"
2. version 2, use ganache-cli
        ganache-cli -m "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"     
3. version 3, use geth
        continue....

Connect Metamask With Private Block Chain
===============
1. Choice Custom RPC in Metamask
2. Enter your private block chain RPC, e.q. http://localhost:8545
3. Click save in Metamask
4. Check your account that in private block chain will show in your Metamask.

Run Truffle
===============
1.  build file
        truffle compile
2.  deploy contract
        truffle migrate --reset --network development

Run Contract From Webservice ( use Web3 and HTML to interactive with contract and Metamask )
===============
1.  open project from browser
        127.0.0.1/<PROJECT FOLDER NAME>/src/index.html
        127.0.0.1/<PROJECT FOLDER NAME>/src/admin.html
        127.0.0.1/<PROJECT FOLDER NAME>/src/transTokenOnly.html
2. 127.0.0.1/<PROJECT FOLDER NAME>/src/index.html
        user can purchase token from this page
3. 127.0.0.1/<PROJECT FOLDER NAME>/src/admin.html
        admin can manage contract from this page
4. 127.0.0.1/<PROJECT FOLDER NAME>/src/transTokenOnly.html
        user and admin can sent token to another user from this page        

Run Truffle Test
===============
        truffle test

Run Truffle From Script ( all of Scripts will put in the scripts folder)
===============
1. run getLockUpTime script
        this script use for get token lockup time.
        truffle exec scripts/getLockUpTime.js [--network <NAME>]
2. run updateLockUpTime script
        this script use for update token lockup time.
        truffle exec scripts/updateLockUpTime.js [--network <NAME>] [--date=<VALUE>] [--time=<VALUE>]
3. run getSaleStatus script
        this script use for check the sale that was be paused or not. 
        truffle exec scripts/getSaleStatus.js [--network <NAME>]     
4. run pauseSale script
        this script use for stop sale.
        truffle exec scripts/pauseSale.js [--network <NAME>]
5. run unPauseSale script
        this script use for restart sale.
        truffle exec scripts/unPauseSale.js [--network <NAME>]            
6. run getAccountTokenBalance script
        this script use for check user token balance
        truffle exec scripts/getAccountTokenBalance.js [--network <name>] [--address=<ACCOUNT ADDRESS>]
7. run getContractAddress script
        this script use for get contract address
        truffle exec scripts/getContractAddress.js [--network <name>]
8. run getSaleRemainingTokenBalance script
        this script use for get contract remaining token balance
        truffle exec scripts/getSaleRemainingTokenBalance.js [--network <name>]
9. run searchWhitlist script
        this script use for check user in which whitelist
        truffle exec scripts/searchWhitlist.js [--network <name>] [--address=<ACCOUNT ADDRESS>]
10. run updateWhitelist script
        this script use for update whitelist
        truffle exec scripts/updateWhitelist.js [--network <name>] [--type=<WHITELIST TYPE>]
11. run getHistory script
        this script use for get token purchase history
        truffle exec scripts/getHistory.js [--network <name>]
12. run getTokenAddress script
        this script use for get token address
        truffle exec scripts/getTokenAddress.js [--network <name>]