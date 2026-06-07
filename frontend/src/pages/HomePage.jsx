import Carousel        from "../components/Carousel";
import AboutSection    from "../components/AboutSection";
import RoomsSection    from "../components/RoomsSection";
import ServicesSections from "../components/ServicesSections";



export default function HomePage() {
  return (
    <div>
      <Carousel />
      <AboutSection />
      <RoomsSection />
      <ServicesSections />
      
    </div>
  );
}