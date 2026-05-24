import axiosInstance from 'apps/user-ui/sr/utils/axiosInstance'; // Adjust path if needed
import { Metadata } from 'next';
import React from 'react';

async function fetchProductDetails(slug: string) {
  const response = await axiosInstance.get(`/product/api/get-product/${slug}`);
  return response.data.product;
}

export async function generateMetadata({ 
    params,
 }:{
     params: { slug: string}; 
 }): Promise<Metadata> {
    const product = await fetchProductDetails(params.slug);
    return {
        title: '${product?.title} | becodemy marketplace,
        description: product?.description|| 
        "disvover high quality products on becodemy marketplace." ,
        openGraph: {
            title: '${product?.title} | becodemy marketplace,
            description: product?.description||
            "disvover high quality products on becodemy marketplace." ,
            images: [
                {
                    url: product?.image,
                    width: 1200,
                    height: 630,
                },
            ],
        },
        twitter:{
            title: '${product?.title} | becodemy marketplace,
            description: product?.description||
            "disvover high quality products on becodemy marketplace." ,
        }
    }
}
 
const Page = async ({ params }: {params: { slug: string}}  => {
  const productDetails = await fetchProductDetails(params?.slug);
 return(

 )

export default Page;
