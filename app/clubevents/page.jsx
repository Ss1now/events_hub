'use client'
import Header from "@/components/header";
import ClubEventsList from "@/components/ClubEventsList";
import Footer from "@/components/footer";
import RatingPrompt from "@/components/RatingPrompt";
import PageToggle from "@/components/PageToggle";

export default function ClubEventsPage() {
  return (
    <>
      <Header/>
      <PageToggle/>
      <ClubEventsList/>
      <Footer/>
      <RatingPrompt/>
    </>
  );
}
