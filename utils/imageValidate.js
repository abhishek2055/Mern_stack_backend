const imageValidate = (images)=>{
    let imagesTable = []
    if(Array.isArray(images)){
        imagesTable = images
    }
    else{
        imagesTable.push(images)
    }

    if(imagesTable.length > 3){
        return { error: "send only 3 image at once"}
    }

    for(let image of imagesTable){
        if(image.size > 1048576) return { error : "Size too large"}

        const filetypes = /jpg|jpeg|png/
        const mimetype = filetypes.test(image.mimetype)
        if(!mimetype) return {error: "incorrect mime type (should be jpg,jpeg pr png)"}

    }
    return {error: false}
}

module.exports = imageValidate