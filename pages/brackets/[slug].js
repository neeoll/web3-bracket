import { ethers } from 'ethers'
import { useState } from 'react'
import Bracket from '../../src/artifacts/contracts/Bracket.sol/Bracket.json'
import styles from "../../styles/Home.module.css"

import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export default function BracketPage({ bracket }) {
    const contractData = {
        address: '',
        receipt: {
            status: 0
        }
    }

    const [formData, fillForm] = useState({})
    const [entrants, addEntrant] = useState(bracket.entrants)
    const [winner, setWinner] = useState()

    async function register(e) {
        e.preventDefault()
        await contractRegistry()
        await getAddress()

        if (contractData.receipt.status == 0) return

        const response = await fetch('../api/entrant/create', {
            method: 'POST',
            body: JSON.stringify({
                address: contractData.address,
                name: formData.name,
                bracketId: bracket.id
            })
        })

        addEntrant([...entrants, {
            address: contractData.address,
            name: formData.name
        }])
        
        return await response.json()
    }

    async function contractRegistry() {
        if (typeof window.ethereum == 'undefined') return 
        try {
            const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(bracket.address, Bracket.abi, signer)
            contractData.receipt = await contract.register(account, formData.name, { value: ethers.utils.parseEther(bracket.entranceFee.toString()) })
        } catch (error) {
            console.log(error)
        }
    }

    async function withdraw() {
        await contractWithdraw()
        await getAddress()

        if (contractData.receipt.status == 0) return

        const response = await fetch('../api/entrant/remove', {
            method: 'POST',
            body: {
                address: contractData.address
            }
        })

        return await response.json()
    }
    
    async function contractWithdraw() {
        if (typeof window.ethereum == 'undefined') return
        try {
            const [account] = await window.etherueum.request({ method: 'eth_requestAccounts' })
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const contract = new ethers.Contract(bracket.address, Bracket.abi, provider)
            contractData.receipt = await contract.cancelEntrance(account)
        } catch (error) {
            console.log(error)
        }
    }

    async function getAddress() {
        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const contract = new ethers.Contract(bracket.address, Bracket.abi, provider)
        contractData.address = await contract.getEntrant(account)
    }

    // TODO
    async function startBracket() {
        if (typeof window.ethereum == 'undefined') return
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const contract = new ethers.Contract(bracket.address, Bracket.abi, provider)
            await contract.startBracket()
        } catch (error) {
            console.log(error)
        }
    }

    // TODO
    async function endBracket() {
        if (typeof window.ethereum == 'undefined') return
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const contract = new ethers.Contract(bracket.address, Bracket.abi, provider)
            const transaction = await contract.endBracket(winner)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <h2>{bracket.name}</h2>
                <p>Organizer: {bracket.organizerAddress}</p>
                <p>Address: {bracket.address}</p>
                <p>Entrance Fee: {bracket.entranceFee}</p>

                <form className={styles.bracketform} onSubmit={endBracket}>
                    <input type="text" placeholder="Address" name="address" onChange={e => setWinner(e.target.value)} />
                    <button type="submit">End</button>
                </form>
                
                <form className={styles.bracketform} onSubmit={register}>
                    <input type="text" placeholder="Name" name="name" onChange={e => fillForm({ ...formData, name: e.target.value })}/>
                    <button type="submit">Register</button>
                </form>

                <button onClick={withdraw}>Withdraw</button>

                <ul className={styles.bracketList}>
                    {entrants?.map(item => (
                        <li key="item.id">
                            <span>{item.name}</span>
                        </li>
                    ))}
                </ul>
            </main>
        </div>
    );
}

export async function getServerSideProps(context) {
    const {slug} = context.query

    const bracket = await prisma.bracket.findFirst({
        where: {
            slug: slug
        },
        include: {
            entrants: true
        }
    })

    return {
        props: {
            bracket
        }
    }
}