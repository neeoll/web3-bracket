import { PrismaClient } from '@prisma/client'
import { ethers } from 'ethers'
import { useState } from 'react'
import { contractAddress } from '../../../config'
import Main from '../../../src/artifacts/contracts/Main.sol/Main.json'
import Link from 'next/link'
import Head from "next/head"
import styles from "../../../styles/Home.module.css"

const prisma = new PrismaClient()

export default function User({ data }) {
    const contractData = {
        address: '',
        organizer: '', 
        receipt: {
            status: 0
        }
    }
    const [formData, fillForm] = useState({})
    const [brackets, setBrackets] = useState(data)

    async function contractCreate(e) {
        e.preventDefault()
        if (typeof window.ethereum == 'undefined') return
        try {
            const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner()
            const contract = new ethers.Contract(contractAddress, Main.abi, signer)
            const transaction = await contract.addBracket(formData.name, parseInt(formData.entranceFee))
            contractData.receipt = await transaction.wait()

            contract.once('Create', async (organizerAddr, contractAddr, event) => {
                console.log(event)
                contractData.address = contractAddr.toString()
                contractData.organizer = organizerAddr.toString()
                saveBracket()
            })
        } catch (error) {
            console.log(`error: ${error}`)
        }
    }

    async function saveBracket() {
        if (contractData.receipt.status == 0) return

        await fetch('../api/bracket/create', {
            method: 'POST',
            body: JSON.stringify({
                name: formData.name,
                organizerAddress: contractData.organizer,
                address: contractData.address,
                entranceFee: parseInt(formData.entranceFee),
                slug: generateSlug(formData.name)
            })
        })
        
        setBrackets([...brackets, {
            name: formData.name,
            address: contractData.address,
            organizer: contractData.organizer,
            entranceFee: formData.entranceFee,
            slug: generateSlug(formData.name)
        }])
    }

    async function contractRemove(item, e) {
        e.preventDefault()
        if (typeof window.ethereum == 'undefined') return
        try {
            const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner()
            const contract = new ethers.Contract(contractAddress, Main.abi, signer)
            const transaction = await contract.removeBracket(item.address)
            contractData.receipt = await transaction.wait()

            contract.once('Remove', async (event) => {
                console.log(event)
                deleteBracket(item, e)
            })

        } catch (error) {
            console.log(`error: ${error}`)
        }
    }
    
    async function deleteBracket(item, e) {
        if (contractData.receipt == 0) return

        await fetch('../api/bracket/remove', {
            method: 'POST',
            body: JSON.stringify(item)
        })

        location.reload()
    }

    function generateSlug(name) {
        return name.replace(/\s+/g, '-')
    }

    return(
        <div className={styles.container}>
            <Head>
                <title>Bracket List</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <ul className={styles.bracketlist}>
                    {brackets.map(item => (
                        <li key={item.address}>
                            <Link href={`./${item.organizer}/bracket/${item.slug}`}>
                              <a>{item.name}</a>
                            </Link>
                            <span>Address: {item.address}</span>
                            <span>Entrance Fee: {item.entranceFee}</span>
                            <button onClick={e => contractRemove(item, e)}>Delete</button>
                        </li>
                    ))}
                </ul>

                <form className={styles.bracketform} onSubmit={contractCreate}>
                    <input type="text" placeholder="Name" name="name" onChange={e => fillForm({ ...formData, name: e.target.value })} require="true"/>
                    <input type="text" placeholder="Entrance Fee" name="entranceFee" onChange={e => fillForm({ ...formData, entranceFee: +e.target.value })} require="true"/>
                    <button type="submit">Add bracket</button>
                </form>

            </main>
        </div>
    )
}

export async function getServerSideProps(context) {
    const query = context.query

    const result = await prisma.bracket.findMany({
        where: { 
            organizerAddress: {
                contains: query.address,
            },
        },
    })

    return {
        props: {
            data: result
        }
    }
}