import React from 'react'
import { ConnectWallet, useAddress } from "@thirdweb-dev/react";
import type {GetServerSideProps} from 'next'
import {sanityClient,urlFor} from '../../sanity'
import {Collection} from '../../typings'
import Link from 'next/link'

interface Props{
    collections: Collection
  }

function NFTDropPage({collections}: Props)
{

   
    const address = useAddress();

  return <div className='flex h-screen flex-col lg:grid lg:grid-cols-10'>
    {/* Left side of the page */}
    <div className="bg-gradient-to-br from-cyan-800 to-orange-500 lg:col-span-4  box-border border-4">
        <div className=' flex flex-col items-center justify-center py-2 lg:min-h-screen box-border border-4' >
            <div className='rounded-xl bg-gradient-to-br from-yellow-400 to-purple-600 p-2 box-border border-4'>
                <img className='w-44 rounded-xl object-cover lg:h-96 lg:w-72' 
                  src={urlFor(collections.previewImage).url()} alt=''/>
           </div>
        
            <div className=' space-y-2 p-5 text-center  box-border border-4'>
                <h1 className='text-4xl font-bold text-white'>{collections.nftCollectionName}</h1>
                <h2 className='text-xl text-gray-300'>{collections.description}</h2>
            </div>
        </div>
    </div>

    {/* Right side of the page */}
    <div className=' flex flex-1 flex-col p-12 lg:col-span-6 box-border border-4'>
        {/* Header */}
        <header className='flex items-center justify-between'>
            <Link  href={'/'}>
            <h1 className='w-52 cursor-pointer text-xl font-extralight sm:w-80'>The NFT 
            <span className=' font-extrabold underline decoration-orange-600/50'> Market Place </span></h1>
            </Link>

            <button className='rounded-full bg-orange-400 px-4 py-2 text-xs font-bold
             text-white lg:px-5 lg:py-3 lg:text-base'><ConnectWallet/></button>
        </header>
        <hr className='my-2 border'/>
        {address && <p className='text-center text-sm text-orange-400'>Your wallet is connected {address.substring(0,5)}...{address.substring(address.length-5)}</p>}

        {/* Content */}
        <div className=' mt-10 flex flex-1 flex-col items-center space-y-6 
                           text-center lg:space-y-0 lg:justify-center box-border border-4'>
            <img className='w-80 object-cover pb-10 lg:h-40' 
                  src={urlFor(collections.mainImage).url()} alt=''/>
            <h1 className='text-3xl font-bold lg:text-5xl lg:font-extrabold'>
                {collections.title}</h1>

            <p className='pt-2 text-xl text-green-500'>13 / 21 NFT's claimed</p>
            
        </div>
        

        {/* Mint button */}
        <button className=' mt-10 h-16 w-full rounded-full bg-orange-400 text-white font-bold'>
            Mint NFT (0.01 ETH)
        </button>
    </div>
   
  </div>
}

export default NFTDropPage

export const getServerSideProps: GetServerSideProps =async ({params}) => {
    const query = `*[_type =="collection" && slug.current == $id][0]{
        _id,
        title,
        description,
        smartcontractaddress,
        nftCollectionName,
        mainImage{
             asset
        },
        previewImage{
          asset
        },
        slug{
          current
        },
        creator->{
          _id,
          name,
          address,
          slug{
            current
        }
        }
      }`

      const collections = await sanityClient.fetch(query,{
        id: params?.id
      })

      if(!collections){
        return {
            notFound: true
        }
      }
      return{
        props: { 
          collections
        }
      }

}