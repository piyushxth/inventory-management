import React from "react";

const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const slug = (await params).slug;
  return <div>Product</div>;
};

export default page;
