// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface SomeToken {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
}


contract UserWallet  {
    address public owner;


    constructor(address _owner) {
        owner = _owner;
    }

    mapping(uint => bool) nonces;


    receive() external payable {}

    function withdrawEth(uint256 amount, uint256 nonce, bytes memory signature) external {
        // проверяем использованный платеж или нет
        require(!nonces[nonce], "nonce already used!");
        // устанвливаем платеж использованным
        nonces[nonce] = true;
        // создаем сообщение на стороне контракта
        bytes32 message = withPrefix(keccak256(abi.encodePacked(
            msg.sender,
            amount,
            nonce,
            address(this)
        )));
        // проверяем подписано ли сообщение владельцем 
        require(
            recoverSigner(message, signature) == owner, "invalid signature!"
        );
        // совершаем трансфер
        payable(msg.sender).transfer(amount);
    }

    function withdrawToken(SomeToken token, uint256 amount, uint256 nonce, bytes memory signature) external {
        require(!nonces[nonce], "nonce already used!");
        // устанвливаем платеж использованным
        nonces[nonce] = true;
        // создаем сообщение на стороне контракта
        bytes32 message = withPrefix(keccak256(abi.encodePacked(
            msg.sender,
            amount,
            nonce,
            address(this)
        )));
        // проверяем подписано ли сообщение владельцем 
        require(
            recoverSigner(message, signature) == owner, "invalid signature!"
        );

        uint256 tokenBalance = token.balanceOf(address(this));
        require(amount <= tokenBalance, "balance is low");
        token.transfer(msg.sender, amount);
    }

    // возвращает того, кто подписал сообщение
    function recoverSigner(bytes32 message, bytes memory signature) private pure returns(address) {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(signature);

        return ecrecover(message, v, r, s);
    }

    // разбивает сообщение на r s v
    function splitSignature(bytes memory signature) private pure returns(uint8 v, bytes32 r, bytes32 s) {
        require(signature.length == 65);

        assembly {
            r := mload(add(signature, 32))

            s := mload(add(signature, 64))

            v := byte(0, mload(add(signature, 96)))
        }

        return(v, r, s);
    }


    // добавляет сообщению в смарт контракте необходимый префикс
     function withPrefix(bytes32 _hash) private pure returns(bytes32) {
        return keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                _hash
            )
        );
    }

 
}