'use client'
import Header from "@/components/header";
import BlogList from "@/components/bloglist";
import Footer from "@/components/footer";
import RatingPrompt from "@/components/RatingPrompt";

export default function Home() {
  return (
    <>
      <Header/>
      <BlogList/>
      <Footer/>
      <RatingPrompt/>
    </>
  );
}
