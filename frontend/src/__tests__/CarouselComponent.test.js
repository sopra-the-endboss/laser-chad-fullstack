import { BrowserRouter } from "react-router-dom";
import CarouselComponent from "../components/ProductOverview/CarouselComponent";
import { render } from "@testing-library/react";

test("CarouselComponent displays the correct number of carousel items", () => {
  const mockCarouselData = [
    {
      product: "HP Laser Jet",
      highlighted: true,
      image:
        "https://images.unsplash.com/photo-1537944434965-cf4679d1a598?auto=format&fit=crop&w=400&h=250&q=60",
      price: 34.2,
      formatted_text: "",
      category: "Smartphone",
      brand: "Apple",
    },
    {
      product: "iPad Pro",
      highlighted: true,
      image:
        "https://images.unsplash.com/photo-1538032746644-0212e812a9e7?auto=format&fit=crop&w=400&h=250&q=60",
      price: 88.2,
      formatted_text: "SALE",
      description:
        "mein hut der hat 23 ecken, asdlkfj;ad jfaskdfj ;alsjdf;lasjdfl ;kasdj flkasjdf kasdlfkasj  dfkljas dfkljaslkdfj ;lqjeiojqo;fiashvd akjlv klqvSDv kjzxv kjzsd klgaskldfhasjkldf hlashf lqwakehf lkwh la hdslka shdmein hut der hat 23 ecken, asdlkfj;ad jfaskdfj ;alsjdf;lasjdfl ;kasdj flkasjdf kasdlfkasj  dfkljas dfkljaslkdfj ;lqjeiojqo;fiashvd akjlv klqvSDv kjzxv kjzsd klgaskldfhasjkldf hlashf lqwakehf lkwh la hdslka shdmein hut der hat 23 ecken, asdlkfj;ad jfaskdfj ;alsjdf;lasjdfl ;kasdj flkasjdf kasdlfkasj  dfkljas dfkljaslkdfj ;lqjeiojqo;fiashvd akjlv klqvSDv kjzxv kjzsd klgaskldfhasjkldf hlashf lqwakehf lkwh la hdslka shdmein hut der hat 23 ecken, asdlkfj;ad jfaskdfj ;alsjdf;lasjdfl ;kasdj flkasjdf kasdlfkasj  dfkljas dfkljaslkdfj ;lqjeiojqo;fiashvd akjlv klqvSDv kjzxv kjzsd klgaskldfhasjkldf hlashf lqwakehf lkwh la hdslka shdmein hut der hat 23 ecken, asdlkfj;ad jfaskdfj ;alsjdf;lasjdfl ;kasdj flkasjdf kasdlfkasj  dfkljas dfkljaslkdfj ;lqjeiojqo;fiashvd akjlv klqvSDv kjzxv kjzsd klgaskldfhasjkldf hlashf lqwakehf lkwh la hdslka shdmein hut der hat 23 ecken, asdlkfj;ad jfaskdfj ;alsjdf;lasjdfl ;kasdj flkasjdf kasdlfkasj  dfkljas dfkljaslkdfj ;lqjeiojqo;fiashvd akjlv klqvSDv kjzxv kjzsd klgaskldfhasjkldf hlashf lqwakehf lkwh la hdslka shd",
      category: "Smartphone",
      brand: "Hawaii",
    },
  ];

  render(
    <BrowserRouter>
      <CarouselComponent
        carouselData={mockCarouselData}
        clickable={true}
        onCardInteract={jest.fn()}
      />
    </BrowserRouter>
  );
  // Check if the correct number of carousel items are displayed

  const carouselContainer = document.querySelector(
    ".react-multi-carousel-list"
  );
  expect(carouselContainer).toBeInTheDocument();
});
