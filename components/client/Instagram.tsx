"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";

interface InstagramPost {
  id: string;
  caption?: string;
  media_type: string;
  media_url: string;
  permalink: string;
}

const Instagram = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);

  useEffect(() => {
    async function getInstagramData() {
      try {
        const res = await fetch(
          `https://graph.instagram.com/me/media?fields=id,media_url,permalink&access_token=IGAAnZBIAD4guVBZAGJqUzA3Mmt6SDIxd0NIMDhYQXBiOTRnLWR0bWY5YmVyczQwY0ZAwQUQweWVNMVFGRjVnUS1FSEZAsVnNuQ1otTnB1R2E0WGtEZAk12aDhJMXVxZAmEwS2tKUV94M3FsTnhiNEgtM2VHYjg2V2tHOF9qWmo0VnJyNAZDZD`,
        );
        const data = await res.json();
        console.log("Instagram Data:", data);
        setPosts(data.data); // save data into state
      } catch (error) {
        console.error("Error fetching Instagram data:", error);
      }
    }

    getInstagramData(); // call once when component mounts
  }, []);
  return (
    <>
      <section className="mx-auto  px-[16px] md:px-[16px] py-[22px] lg:px-[40px]  overflow-hidden">
        <header className="flex flex-wrap flex-col md:flex-row items-start lg:items-end justify-between pb-6 gap-0 md:gap-4">
          <div className="flex flex-col gap-4">
            <h2 className="uppercase text-balance leading-8 fw-bold text-[20px] lg:text-[30px] tracking-[-1px]">
              #DOMORE
            </h2>
          </div>
          <h2 className="uppercase text-balance leading-8 fw-bold text-[20px] lg:text-[30px] tracking-[-1px]">
            @IconicOfficial
          </h2>
        </header>
      </section>
      {/* <section className="">
        <ul className="flex overflow-hidden">
          <li className="flex bg-[#f3f3f3] w-[150px] flex-none aspect-[4/5] basis-auto lg:basis-[16.6666666667%] ">
            <figure className="relative flex w-full">
              <Image
                src="/client/instagram/instagram1.jpg"
                alt="Person on an escalator wearing the Stubble & Co 40L travel backpack with capacity annotation."
                width={960}
                height={1200}
                sizes="(min-width: 1100px) 410px, 250px"
                className=" h-full w-full object-cover"
                priority={false} // change to true if it's above the fold
              />
            </figure>
          </li>
          <li className="flex bg-[#f3f3f3] w-[150px] flex-none aspect-[4/5] basis-auto lg:basis-[16.6666666667%] ">
            <figure className="relative flex w-full">
              <Image
                src="/client/instagram/instagram1.jpg"
                alt="Person on an escalator wearing the Stubble & Co 40L travel backpack with capacity annotation."
                width={960}
                height={1200}
                sizes="(min-width: 1100px) 410px, 250px"
                className=" h-full w-full object-cover"
                priority={false} // change to true if it's above the fold
              />
            </figure>
          </li>
          <li className="flex bg-[#f3f3f3] w-[150px] flex-none aspect-[4/5] basis-auto lg:basis-[16.6666666667%] ">
            <figure className="relative flex w-full">
              <Image
                src="/client/instagram/instagram1.jpg"
                alt="Person on an escalator wearing the Stubble & Co 40L travel backpack with capacity annotation."
                width={960}
                height={1200}
                sizes="(min-width: 1100px) 410px, 250px"
                className=" h-full w-full object-cover"
                priority={false} // change to true if it's above the fold
              />
            </figure>
          </li>
          <li className="flex bg-[#f3f3f3] w-[150px] flex-none aspect-[4/5] basis-auto lg:basis-[16.6666666667%] ">
            <figure className="relative flex w-full">
              <Image
                src="/client/instagram/instagram1.jpg"
                alt="Person on an escalator wearing the Stubble & Co 40L travel backpack with capacity annotation."
                width={960}
                height={1200}
                sizes="(min-width: 1100px) 410px, 250px"
                className=" h-full w-full object-cover"
                priority={false} // change to true if it's above the fold
              />
            </figure>
          </li>
          <li className="flex bg-[#f3f3f3] w-[150px] flex-none aspect-[4/5] basis-auto lg:basis-[16.6666666667%] ">
            <figure className="relative flex w-full">
              <Image
                src="/client/instagram/instagram1.jpg"
                alt="Person on an escalator wearing the Stubble & Co 40L travel backpack with capacity annotation."
                width={960}
                height={1200}
                sizes="(min-width: 1100px) 410px, 250px"
                className=" h-full w-full object-cover"
                priority={false} // change to true if it's above the fold
              />
            </figure>
          </li>
          <li className="flex bg-[#f3f3f3] w-[150px] flex-none aspect-[4/5] basis-auto lg:basis-[16.6666666667%] ">
            <figure className="relative flex w-full">
              <Image
                src="/client/instagram/instagram1.jpg"
                alt="Person on an escalator wearing the Stubble & Co 40L travel backpack with capacity annotation."
                width={960}
                height={1200}
                sizes="(min-width: 1100px) 410px, 250px"
                className=" h-full w-full object-cover"
                priority={false} // change to true if it's above the fold
              />
            </figure>
          </li>
          <li className="flex bg-[#f3f3f3] w-[150px] flex-none aspect-[4/5] basis-auto lg:basis-[16.6666666667%] ">
            <figure className="relative flex w-full">
              <Image
                src="/client/instagram/instagram1.jpg"
                alt="Person on an escalator wearing the Stubble & Co 40L travel backpack with capacity annotation."
                width={960}
                height={1200}
                sizes="(min-width: 1100px) 410px, 250px"
                className=" h-full w-full object-cover"
                priority={false} // change to true if it's above the fold
              />
            </figure>
          </li>
        </ul>
      </section> */}
      <section>
        <ul className="flex overflow-hidden">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex bg-[#f3f3f3] w-[150px] flex-none aspect-[4/5] basis-auto lg:basis-[16.6666666667%] "
            >
              <a
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <figure className="relative flex w-full">
                  <Image
                    src={post.media_url}
                    alt="Instagram post"
                    width={960}
                    sizes="(min-width: 1100px) 410px, 250px"
                    priority={false} // change to true if it's above the fold
                    height={1200}
                    className="h-full w-full object-cover"
                  />
                </figure>
                <Image
                  src={post.media_url}
                  alt="Instagram post"
                  width={960}
                  height={1200}
                  className="h-full w-full object-cover"
                />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
};

export default Instagram;
