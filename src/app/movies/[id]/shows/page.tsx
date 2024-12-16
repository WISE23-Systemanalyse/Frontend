import React from 'react'

const ShowPages = ({ params }: { params: { id: string } }) => {
  return (
    <div className='flex justify-center items-center h-screen w-screend'>
        <div>
            ShowPage for Movie {params.id} 
        </div>
        
    </div>
  )
}

export default ShowPages