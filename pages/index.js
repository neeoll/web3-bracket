import {PrismaClient} from '@prisma/client'
import { useState } from 'react'
import Link from 'next/link'
import Head from "next/head"
import styles from "../styles/Home.module.css"
import { useRouter } from 'next/router'

const prisma = new PrismaClient()

export default function Brackets({ data }) {

    const router = useRouter()

    const [errorMessage, setErrorMessage] = useState(null)
	const [connButtonText, setConnButtonText] = useState('Connect Wallet')
    const [brackets, setBrackets] = useState(data)

    const connectWalletHandler = () => {
		if (typeof window.ethereum == 'undefined') {
            console.log('Need to install MetaMask')
			setErrorMessage('Please install MetaMask browser extension to interact')
        }

        window.ethereum.request({ method: 'eth_requestAccounts'})
        .then(result => {
            router.push(`users/${result[0]}`)
            setConnButtonText('Wallet Connected')
        })
        .catch(error => {
            setErrorMessage(error.message)
        
        })
	}

    return (
        <div className={styles.container}>
            <Head>
                <title>Bracket List</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>

                <h4> {"Get/Set Contract interaction"} </h4>
                <button onClick={connectWalletHandler}>{connButtonText}</button>
                
                {errorMessage}

                <ul className={styles.bracketlist}>
                    {brackets.map(item => (
                        <li key="item.id">
                            <Link href={`./users/${item.organizerAddress}/bracket/${item.slug}`}>
                              <a>{item.name}</a>
                            </Link>
                            <span>Organizer: {item.organizerAddress}</span>
                            <span>Entrance Fee: {item.entranceFee}</span>
                        </li>
                    ))}
                </ul>
            </main>
        </div>
    )
}

export async function getServerSideProps() {
    const brackets = await prisma.bracket.findMany()

    return {
        props: {
            data: brackets
        }
    }
}