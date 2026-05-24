import {create} from "zustand";
import{persist} from "zustand/middleware";
import { sendKafkaEvent } from "../actions/track-user";

type Product={
id: string;
title:string;
price:number;
image:string;
quantity?:number;
shopId:string;
}


type Store={
    cart: Product[];
    wishlist: Product[];
    addToCart: (
        product:Product,
        user:any,
        location:any,
        deviceInfo:any,
    ) => void;
        removeFromCart: (
            Id:string,
        user:any,
        location:any,
        deviceInfo:any,
        ) => void;
        addToWishlist: (
        product:Product,
        user:any,
        location:any,
        deviceInfo:any,
    ) => void;
    removeFromWishlist: (
        id:string,
        user:any,
        location:any,
        deviceInfo:any,
    ) => void;
};

export const userStore = create<Store>()(
    persist
    (set,get) => ({
        cart:[],
        wishlist:[],

     
        //add to cart
        addToCart: (product,user,location,deviceInfo) => {
            set((state) => {
                const existingProduct = state.cart?.find((item) => item.id === product.id);
                if(existingProduct){
                    return {
                        cart: state.cart.map((item) =>item.id===product.id ? {...item}
                        item.id === product.id ? {...item, quantity: (item.quantity ?? 1) + 1)} 
                        : item
                        ),
                    };
                }
                return { cart: [...(state.cart , {...product, quantity: 1}] },
                    });
                },

                //send kafka event 
                 if (user?.id && location && deviceInfo) {
                  sendKafkaEvent({
                    userId: user.id,
                    productId : product?.id,
                    shopId: product?.shopId,
                    action: "add_to_cart",
                    country: location?.country || "unknown", 
        });
      }
    },

               // removeFromCart: (id,user,location,deviceInfo) => {
               removeFromCart: (id,user,location,deviceInfo) => {
               // find the product before calling set 
               const removeProduct=get().cart.find((item) => item.id === id);
              
               set((state)=> ({
                cart: state.cart.filter((item) => item.id !== id),
               }));
            

            //send kafka event
            if(user?.id && location && deviceInfo && removeProduct){
                sendKafkaEvent({
                    userId: user.id,
                    productId : removeProduct?.id,
                    shopId: removeProduct?.shopId,
                    action: "remove_from_cart",
                    country: location?.country || "unknown", 
                    city: location?.city || "unknown",
                    device: deviceInfo?.device || "unknown device",
                });
            }
        },           
            
               //Add to wishlist
            addToWishlist: (product,user,location,deviceInfo) => { 
                set((state) => {
                    if(state.wishlist.find((item) => item.id === product.id)){
                        return state; // Product already in wishlist, do nothing
                        return{wishlist : [..state.wishlist,product]};
                    })
                 //send kafka event 
                 if (user?.id && location && deviceInfo && product) {
                  sendKafkaEvent({
                    userId: user.id,
                    productId : product?.id,
                    shopId: product?.shopId,
                    action: "add_to_wishlist",
                    country: location?.country || "unknown", 
                    city: location?.city || "unknown",
                    device: deviceInfo?.device || "unknown device",
        });
      }
    },


                removeFromWishlist: (id,user,location,deviceInfo) => {
                    //Find the product before calling 'set'
                    const removeProduct = get().wishlist.find((item) => item.id === id);
                     
                    set((state) => ({
                        wishlist: state.wishlist.filter((item) => item.id !== id),
                    }));

                    //send kafka event 
                 if (user?.id && location && deviceInfo && removeProduct) {
                  sendKafkaEvent({
                    userId: user.id,
                    productId : removeProduct?.id,
                    shopId: removeProduct?.shopId,
                    action: "remove_from_wishlist",
                    country: location?.country || "unknown", 
                    city: location?.city || "unknown",
                    device: deviceInfo?.device || "unknown device",
        });
      }
    },
                },
            }),
            {name:"store-storage"})
        )
    );

            




    export const useStore = create<Store>()((set, get) => ({
  addToCart: (product, user, location, deviceInfo) => {
    set((state) => {
      // 1. Send Kafka Event if all required tracking data is present
      

      // 2. Return the updated state to update the local cart UI
      // (Make sure to append the item to your cart array here)
      return {
        ...state,
        // example: cart: [...state.cart, product]
      };
    });
  },
}));