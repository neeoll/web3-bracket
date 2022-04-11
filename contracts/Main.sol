//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import './Bracket.sol';

contract Main {

    event Create(address organizerAddr, address contractAddr);
    event Remove();

    struct BracketReference {
        uint index;
        address addr;
    }

    mapping (address => BracketReference) brackets;
    address[] bracketIndices;

    function addBracket(string memory name, uint entranceFee) public {
        Bracket temp = new Bracket(entranceFee, name);

        brackets[address(temp)].addr = address(temp);
        bracketIndices.push(address(temp));
        brackets[address(temp)].index = bracketIndices.length - 1;
        temp.transferOwnership(msg.sender);

        emit Create(address(msg.sender), address(temp));
    }

    function removeBracket(address bracketAddr) public {
        // create reference to bracket using given address
        Bracket ref = Bracket(bracketAddr);
        // use guard clause to ensure organizer called method
        require(msg.sender == ref.getOrganizer(), "Only the organizer can delete the bracket.");
        // get index of bracket being removed
        uint removalIndex = brackets[bracketAddr].index;
        // get address of last bracket in array
        address replacementAddress = bracketIndices[bracketIndices.length - 1];
        // set address at removal index to last address
        bracketIndices[removalIndex] = replacementAddress;
        // set index of the newly replaced address to the original index
        brackets[replacementAddress].index = removalIndex;
        // delete reference to index making it inaccessible through the contract*
        bracketIndices.pop(); 

        emit Remove();
    }
    // *bracket can still be accessed if address is known until the node goes stale

    function getBrackets() public view returns(address[] memory) {
        return bracketIndices;
    }
}