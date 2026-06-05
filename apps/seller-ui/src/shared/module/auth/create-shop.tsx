import { shopCategories } from 'apps/seller-ui/src/utils/categories';
import React from 'react'

const Createshop = ({
    sellerID,
    setActiveStep,
}:{
     sellerID:string;
     setActiveStep:(step:number) => void;
}) => {
    const{
        register,
        handelSubmit,
        formState:{errors},
    } = useForm();

    const shopCreateMutation= useMutation({
        mutationFn: async(data:FormData)=>{
            cosnt response= await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-shop`,
                data
            );
            return response.data;
    },
onSuccess:()=>{    setActiveStep(3)
}

})
;
const onSubmit = async(data:FormData) => {
    const shopData = {...data, sellerId};
    shopCreateMutation.mutate(shopData);
} ; 
    const countWords = (text:string) => text.trim().split(/\s+/).length;
    return(

<div>
      
<form onSubmit={handelSubmit(onSubmit)}>
    <h3 className='text-2xl font-semibold text-center mb-4'>Setup new Shop</h3>
    <label className='block text-gray-700 mb-1'>
        Name
    </label>
    <input
    type='text'
    placeholder='shop name'
    className='w-full border border-gray-300 rounded-[4px] py-2 mb-1 outline-none'
    {...register("name",{required:"Shop name is required"})}
    />
    {errors.name && (
        <p className='text-red-500 text-sm mb-4'>{errors.name.message}</p>
    )}
    <label className='block text-gray-700 mb-1'>Bio(Max 100 words) *</label>
    <textarea
    type='text'
    placeholder='short description about your shop'
    className='w-full border border-gray-300 rounded-[4px] py-2 mb-1 outline-none'
    {...register("bio",{required:"Bio is required"})
        validate:(value)=>
            countWords(value) <= 100 || "Bio must be less than 100 words"
        })}
    />
    {errors.bio && (
        <p className='text-red-500 text-sm mb-4'>{errors.bio.message}</p>
    )}

    <label className='block text-gray-700 mb-1'>Address *</label>
    <input
    type='text'
    placeholder='shop address'
    className='w-full border border-gray-300 rounded-[4px] py-2 mb-1 outline-none'
    {...register("address",{required:"Address is required"})}
    />
    {errors.address && (
        <p className='text-red-500 text-sm mb-4'>{errors.address.message}</p>
    )}
    <label className='block text-gray-700 mb-1'>Opening Hours *</label>
    <input
    type='text'
    placeholder='e.g 9:00 AM - 9:00 PM'
    className='w-full border border-gray-300 rounded-[4px] py-2 mb-1 outline-none'
    {...register("openingHours",{required:"Opening hours are required"})}
    />
    {errors.openingHours && (
        <p className='text-red-500 text-sm mb-4'>{errors.openingHours.message}</p>
    )}
    <label className='block text-gray-700 mb-1'>Website *</label>
    <input
    type='text'
    placeholder='shop website'
    className='w-full border border-gray-300 rounded-[4px] py-2 mb-1 outline-none'
    {...register("website",{
        pattern:{
            value:/^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-]*)*\/?$/,
            message:"Invalid website URL",
        },
    })}         
    />
    {errors.website && (
        <p className='text-red-500 text-sm mb-4'>{errors.website.message}</p>
    )}
     
     <label className='block text-gray-700 mb-1'>Category *</label>
     <select
     className='w-full border border-gray-300 rounded-[4px] py-2 mb-1 outline-none'
     {...register("category",{required:"Category is required"})}
     >
        <option value="">Select category</option>
        {shopCategories.map((category)=>(
            <option key={category.value} value={category.value}>
                {category.label}
            </option>
        ))}
     </select>
     {errors.category && (
        <p className='text-red-500 text-sm mb-4'>{errors.category.message}</p>
    )}
     
     <button
     type='submit'
     type={"submit"}
     className='w-full mt-4 bg-blue-600 text-white py-2 rounded-[4px] hover:bg-blue-600 transition-colors'
     >
        Create Shop
     </button>
    

</form>

</div>

  );};
  export default Createshop 