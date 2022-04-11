//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

contract Bracket {
    event Start(string str);
    event End();
    event Register(address entrantAddr);
    event Withdraw(address withdrawalAddr);

    address organizer;
    string name;
    uint entranceFee;
    bool started;
    uint prizePot;

    struct Entrant {
        string name;
        address addr;
        uint amountPaid;
        uint index;
    }

    mapping(address => Entrant) entrants;
    address[] entrantIndex;

    constructor(uint _entranceFee, string memory _name) {
        organizer = msg.sender;
        entranceFee = _entranceFee;
        name = _name;
        started = false;
    }

    // State modifiying (Write) operations
    function start() public onlyOrganizer {
        require(entrantIndex.length > 0, "Cannot start a bracket with no entrants");
        require(!started, "Bracket has already started");
        started = true;

        emit Start("Bracket started");
    }

    function end(address winner) public payable onlyOrganizer {
        require(started, "Bracket has not yet been started");
        require(isEntrant(winner), "Cannot declare someone who isn't an entrant as the winner");
        (bool sent, ) = payable(winner).call{value: prizePot}('');
        require(sent, "Payment failed");

        emit End();
    }

    function register(string memory _name) public payable {
        // require(msg.sender != organizer, "Cannot enter a tournament you're organizing");
        require(!started, "Cannot register after the bracket has been started");
        require(!isEntrant(address(msg.sender)), "You've already registered for this bracket");
        prizePot += msg.value;

        entrants[msg.sender].name = _name;
        entrants[msg.sender].addr = msg.sender;
        entrants[msg.sender].amountPaid = msg.value;
        entrantIndex.push(msg.sender);
        entrants[msg.sender].index = entrantIndex.length - 1;

        emit Register(address(msg.sender));
    }

    function cancelEntrance() public payable {
        require(isEntrant(msg.sender), "Cannot withdraw if you're not entered");
        uint bal = entrants[msg.sender].amountPaid;
        entrants[msg.sender].amountPaid = 0;
        (bool sent, ) = payable(msg.sender).call{value: bal}('');
        require(sent, "Payment failed");

        uint entrantToRemove = entrants[msg.sender].index;
        address indexToMove = entrantIndex[entrantIndex.length - 1];
        entrantIndex[entrantToRemove] = indexToMove;
        entrants[indexToMove].index = entrantToRemove;
        entrantIndex.pop();

        emit Withdraw(address(msg.sender));
    }

    function isEntrant(address addr) public view returns(bool) {
        if (entrantIndex.length == 0) return false;
        return (entrantIndex[entrants[addr].index] == addr);
    }

    // State modifiying (Write) operations
    function transferOwnership(address addr) public onlyOrganizer{ organizer = addr; }

    // Non state modifying (Read) operations
    function getName() public view returns(string memory) { return name; }
    function getOrganizer() public view returns(address) { return organizer; }
    function getAddress() public view returns(address) { return address(this); }
    function getEntranceFee() public view returns(uint) { return entranceFee; }
    function getPrizePot() public view returns(uint) { return prizePot; }
    function getEntrant(address addr) public view returns(address) { return entrants[addr].addr; }

    modifier onlyOrganizer() {
        require(msg.sender == organizer, "This is restricted to the tournament organizer");
        _;
    }
}