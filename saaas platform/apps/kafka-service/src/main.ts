import {kafka} from "@packages/utils/kafka";
update (updateUserAnalytics} from "./services/analytics.service";

const consumerr=kafka.consumer({groupId:"kafka-service-group"});

const eventQueue: any[]=[];

const pocessQueue=async() => {
    if(eventQueue.length===0) return 0;

    const events=[...eventQueue];
    eventQueue.length=0;

    for(const event of events){
        if(event.action==="shop_visit"){
     //update shop analytics
        }

        const validActions=[
            "add_to_wishlist",
            "add_to_cart",
            "product_view",
            "remove_from_cart",
            "remove_from_wishlist",
        ];
        if(!event.action || !validActions.includes(event.action)){
            continue;
        }
        try{
        await updateUserAnalytics(event);
        }catch(error){ 
          console.log("Error processing event",error);  
        }
}
};

setInterval(processQueue,3000); //3000ms
 
//kafka consumer for user events
export const consumeKafkaMeassages=async() => {
    //connnect to the kafka broker
    await consumerr.connect();
    await consumerr.subscribe({topic:"users-events",fromBeginning:false});

    await consumerr.run({
        eachMessage:async({message} => {
            if(!message.value) return;
            const event=JSON.parse(message.value.toString());
            eventQueue.push(event);
        })
    });
};
            
consumeKfakaMessages().catch(console.eror);