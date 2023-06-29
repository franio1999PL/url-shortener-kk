import { NextApiRequest, NextApiResponse, NextPage } from 'next'
import Head from 'next/head'
import connectToDatabase from '../mongodb'
import { COLLECTION_NAMES } from '../types'
import { PrismaClient } from '@prisma/client'

export async function getServerSideProps (request: NextApiRequest) {
  const prisma = new PrismaClient()
  const hash = request.query.hash as string
  const database = await prisma.shortUrl
  const campaign = await database.findUnique({ where: { uid: hash } })

  console.log(campaign)

  if (campaign) {
    // Inkrementuj liczbę wejść w link
    // await campaignCollection.updateOne(
    // { _id: campaign._id },
    // { $inc: { visits: 1 } }
    // )

    return {
      redirect: {
        destination: campaign.link,
        permanent: false
      }
    }
  }

  return {
    props: {}
  }
}

const HashPage: NextPage = () => {
  return (
    <div>
      <Head>
        <title>URL Shortener</title>
        <meta name='description' content='Url Shortener' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div style={{ textAlign: 'center' }}>
        <h1>Error 404</h1>
        <h2>
          Nie ma takiej strony lub link jest uszkodzony zgłoś to na email{' '}
          <a href='mailto:sikorafranek@proton.me'>SIKORAFRANEK@PROTON.ME</a>
        </h2>
      </div>
    </div>
  )
}

export default HashPage
