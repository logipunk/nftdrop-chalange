import React, { useEffect, useState } from 'react'
import { ConnectWallet, useAddress,useContract,useNFT,useNFTDrop } from "@thirdweb-dev/react";
import type {GetServerSideProps} from 'next'
import {sanityClient,urlFor} from '../../sanity'
import {Collection} from '../../typings'
import Link from 'next/link'
import { BigNumber, ethers } from 'ethers';
import toast, {Toaster} from 'react-hot-toast'

interface Props{
    collections: Collection
  }

function NFTDropPage({collections}: Props)
{

  const [claimedSupply, setClaimedSupply] = useState<number>(0);
  const [totalSupply, setTotalSupply] = useState<BigNumber>();
  const [priceInETH, setPriceInETH] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);
  const nftDrop  = useContract(collections.smartcontractaddress,"nft-drop");
    
    

  const nftDropII  = useNFTDrop(collections.smartcontractaddress);
  

  

    // use for wallet address
    const address = useAddress();
    useEffect(()=>{
      if(!nftDropII) return;

      const fetchETHPrice = async() =>{
          const claimCondition = await nftDropII.claimConditions.getAll();
          setPriceInETH(claimCondition?.[0].currencyMetadata.displayValue);
      }

      fetchETHPrice();

    },[nftDropII])

    useEffect(()=>{
      if(!nftDropII) return;
    

      const fetchNFTDropData = async () =>{

        setLoading(true);

        const claimedNFTs = await  nftDropII.getAllClaimed();//nftDrop.contract?.totalClaimedSupply();
        const totalNFTs = await nftDropII.totalSupply();//nftDrop.contract?.totalSupply();

        //const claimedNFTsII = await nftDropII.getAllClaimed();
        //const totalNFTsII = await nftDropII.totalSupply();

        setClaimedSupply(claimedNFTs.length);
        setTotalSupply(totalNFTs);

        console.log("totalNFTs..." + totalNFTs);

        //setClaimedSupply(claimedNFTsII.length)
        setLoading(false);

        console.log("loading..." + loading);

      }

      fetchNFTDropData();

    },[nftDropII])



    //minting
    const mintNFT = () =>{
      if(!nftDropII || !address) return;

      const quantity = 1;//how many NFT to mint 

      setLoading(true);

      const notification = toast.loading("Minting ....",{
        style:{
          background:'white',
          color:"green",
          fontWeight:'bolder',
          fontSize:'17px',
          padding:'20px'
        }
      })

      nftDropII.claimTo(address, quantity).then(async(tx) =>{

          const receipt = tx[0].receipt;
          const claimedTokenID = tx[0].id;
          const claimedNFT = tx[0].data();
          
          toast("HOOOORAAAY.... You Successfully Minted your NFT",{
            duration:8000,
            style:{
              background:'green',
              color:"white",
              fontWeight:'bolder',
              fontSize:'17px',
              padding:'20px'
            }
          })

          console.log(receipt);
          console.log(claimedTokenID);
          console.log(claimedNFT);

          const claimedNFTs = await  nftDropII.getAllClaimed();
          setClaimedSupply(claimedNFTs.length);

      }).catch(err =>{
        console.log(err);
        toast('FM2T ...... something went wrong...',{
          style:{
            background:'red',
            color:"white",
            fontWeight:'bolder',
            fontSize:'17px',
            padding:'20px'
        },
      })
    })
      .finally(() => {
        setLoading(false);
        toast.dismiss(notification);
      })
      ;
    }

  return <div className='flex h-screen flex-col lg:grid lg:grid-cols-10'>
    <Toaster position='top-center'/>
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

            {loading ? (
              <p className='pt-2 text-xl text-green-500 animate-bounce'>Loading supply count...</p>
            
            ):(
              <p className='pt-2 text-xl text-green-500'>{claimedSupply} / {totalSupply?.toString()} NFT's claimed</p>
            
            )}

            {loading && (
              <img className='h-80 w-80 object-contain' src='https://cdn.hackernoon.com/images/0*4Gzjgh9Y7Gu8KEtZ.gif'/>
            )}
            
        </div>
        

        {/* Mint button */}
        <button onClick={mintNFT} disabled={loading || claimedSupply === totalSupply?.toNumber() || !address} 
        className=' mt-10 h-16 w-full rounded-full bg-orange-400 text-white font-bold disabled:bg-gray-400'>
          {loading ? (
              <>Loading</>
            ):
             claimedSupply === totalSupply?.toNumber() ?(
              <>SOLD OUT</>
            ): !address ? (
              <>Connect Your Wallet</>
            ):(
              <span className='font-bold'>Mint NFT ({priceInETH} ETH)</span>
            )}
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

