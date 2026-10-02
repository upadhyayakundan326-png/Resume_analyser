const resume = require("../models/resume")

const analyseresume = async(req,res)=>{
    try{
const allResume = resume.aggregate([
    {
        $match:{
            user:req.user.userId
        }
    },
    {
        $group:{
            totalresume:{$sum:1},
            maximunscore:{$max:"$score"},
            minimumscore:{$min:"$score"},
            averagescore:{$avg:"$score"}

        }

    }
  
])
res.status(200).json({
    success:true,
     result:allResume[0]||{
        totalresume:0,
         maximunscore:0,
            minimumscore:0,
            averagescore:0


    }

})
}
catch(error){

}
}
    
