'use client'
import React from 'react';
import Image from 'next/image';

const EleganceSection = () => {
  return (
    <section className=""><div className="grid grid-cols-3 md:grid-cols-3 grid-rows-2 md:grid-rows-2 gap-2 md:gap-2 m-4">
    <div className="col-start-1 row-start-1 col-span-2 md:col-start-1 md:row-start-1 md:col-span-2 md:row-span-1  rounded-md p-10">
    <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-semibold tracking-wider ff-fashionwacks">
                Wrap in Elegance
              </h2>
              <h3 className="text-4xl md:text-5xl fw-light">
                Shine with Confidence
              </h3>
            </div>
    </div>
    <div className="relative col-start-1 row-start-2 md:col-start-1 md:row-start-2 md:col-span-1 md:row-span-1  rounded-md p-10">
        <Image src="/client/product/product1.png" alt="elegance" fill className='object-cover rounded-2xl' />
        
    </div>
    <div className="relative col-start-2 row-start-2 md:col-start-2 md:row-start-2 md:col-span-1 md:row-span-1  rounded-md p-10">
    <Image src="/client/product/product1.png" alt="elegance" fill className='object-cover rounded-2xl' />

    </div>
    <div className="relative col-start-3 row-start-1 row-span-2 md:col-start-3 md:row-start-1 md:col-span-1 md:row-span-2  rounded-md p-10">
    <Image src="/client/product/product1.png" alt="elegance" fill className='object-cover rounded-2xl' />

    </div>
    
  </div>
    </section>
  );
};

export default EleganceSection; 