import { ethers } from 'ethers'
import { useState } from 'react'
import Bracket from '../../../../src/artifacts/contracts/Bracket.sol/Bracket.json'
import styles from '../../../../styles/Home.module.css'

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

    async function contractRegister(e) {
        e.preventDefault()
        if (typeof window.ethereum == 'undefined') return 
        try {
            const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner()
            const contract = new ethers.Contract(bracket.address, Bracket.abi, signer)
            const transaction = await contract.register(formData.name, { value: ethers.utils.parseEther(bracket.entranceFee.toString()) })
            contractData.receipt = await transaction.wait()

            contract.once('Register', async (entrantAddr, event) => {
                console.log(event)
                contractData.address = entrantAddr.toString()
                register()
            })
        } catch (error) {
            console.log(error)
        }
    }

    async function register() {
        if (contractData.receipt.status == 0) return
        await fetch('../../api/entrant/create', {
            method: 'POST',
            body: JSON.stringify({
                address: contractData.address,
                name: formData.name,
                bracketAddress: bracket.address
            })
        })

        addEntrant([...entrants, {
            address: contractData.address,
            name: formData.name
        }])
    }
    
    async function contractWithdraw() {
        if (typeof window.ethereum == 'undefined') return
        try {
            const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner()
            const contract = new ethers.Contract(bracket.address, Bracket.abi, signer)
            const transaction = await contract.cancelEntrance(account)
            contractData.receipt = await transaction.wait()

            contract.once('Withdraw', async (withdrawalAddr, event) => {
                console.log(event)
                contractData.address = withdrawalAddr.toString()
                withdraw()
            })
        } catch (error) {
            console.log(error)
        }
    }

    async function withdraw() {
        if (contractData.receipt.status == 0) return
        await fetch('../../api/entrant/remove', {
            method: 'POST',
            body: {
                address: contractData.address
            }
        })

        location.reload()
    }

    // TODO
    async function contractStart() {
        if (typeof window.ethereum == 'undefined') return
        try {
            const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner()
            const contract = new ethers.Contract(bracket.address, Bracket.abi, signer)
            const transaction = await contract.start()
            contractData.receipt = await transaction.wait()

            contract.once('Start', async (str, event) => {
                console.log(str)
                console.log(event)
                startBracket()
            })
        } catch (error) {
            console.log(error)
        }
    }

    async function startBracket() {
        if (contractData.receipt == 0) return
        await fetch('../../api/bracket/start_end', {
            method: 'POST',
            body: {
                data: JSON.stringify({
                    address: bracket.address, 
                    started: true
                })
            }
        })
    }

    // TODO
    async function endBracket() {
        if (typeof window.ethereum == 'undefined') return
        try {
            const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner()
            const contract = new ethers.Contract(bracket.address, Bracket.abi, signer)
            const transaction = await contract.end()
            contractData.receipt = await transaction.wait()

            contract.once('End', async (event) => {
                console.log(event)
            })
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
                <button onClick={contractStart}>Start</button>

                <form className={styles.bracketform} onSubmit={endBracket}>
                    <input type="text" placeholder="Address" name="address" onChange={e => setWinner(e.target.value)} />
                    <button type="submit">End</button>
                </form>
                
                <form className={styles.bracketform} onSubmit={contractRegister}>
                    <input type="text" placeholder="Name" name="name" onChange={e => fillForm({ ...formData, name: e.target.value })}/>
                    <button type="submit">Register</button>
                </form>

                <button onClick={contractWithdraw}>Withdraw</button>

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
    const query = context.query

    const bracket = await prisma.bracket.findFirst({
        where: {
            AND: [
                {
                    organizerAddress: {
                        contains: query.address
                    }
                },
                {
                    slug: {
                        contains: query.slug
                    }
                }
            ]
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