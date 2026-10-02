const resume = require("../models/resume")

const getAllResume = async(req,res)=>{
  try{
    const userId = req.user.userId

    const page = Number(req.query.page)||1
    const limit = Number(req.query.limit)||10
    const skip = (page-1)*limit

 // Sirf logged-in user ke total resumes
        const totalResumes = await resume.countDocuments({
            user: userId
        });

        //



const getresumes = await resume.find({
  user:userId,
})
 .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    
       // Total pages
        const totalPages = Math.ceil(totalResumes / limit)
        console.log(totalPages)

        res.status(200).json({
                success:true,
                page:page,
                 limit:limit,
                 totalResumes:totalResumes,
                 totalPages:totalPages,
                 resumes:getresumes

                
        })
    }
    catch(error){ 
        res.status(400).json({

        
        message:error.message
    })
    }
}
module.exports =  {getAllResume}
