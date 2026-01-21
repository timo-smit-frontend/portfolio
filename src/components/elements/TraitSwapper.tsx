import React, { useEffect, useState } from "react";

const characterTraits = [
  "creative",
  "proactive",
  "cool",
  "motivated",
  "social",
  "enthusiastic",
  "happy",
  "nerdy",
  "respectable",
  "weird",
  "funny",
  "adventurous",
  "surprising",
  "badass",
  "fashionable",
  "inventive",
  "playful",
  "daring",
  "charismatic",
  "eccentric",
  "optimistic",
  "lively",
  "spirited",
  "humorous",
  "imaginative",
  "bold",
  "artistic",
  "dreamy",
  "intuitive",
  "spontaneous",
  "compassionate",
  "kind-hearted",
  "energetic",
  "dynamic",
  "sympathetic",
];
const TraitSwapper = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [currentTrait, setCurrentTrait] = useState(characterTraits[0]);
  const [isErasing, setIsErasing] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [randomTrait, setRandomTrait] = useState("");

  useEffect(() => {
    function handleResize() {
      setIsSmallScreen(window.innerWidth < 800);
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    let timeoutId;

    if (!isErasing && charIndex < currentTrait.length) {
      // Typing phase
      timeoutId = setTimeout(() => {
        setCharIndex(charIndex + 1);
      }, 300);
    } else if (isErasing && charIndex > 0) {
      // Erasing phase
      timeoutId = setTimeout(() => {
        setCharIndex(charIndex - 1);
      }, 75);
    } else if (!isErasing && charIndex >= currentTrait.length) {
      // Start erasing after a delay
      timeoutId = setTimeout(() => {
        setIsErasing(true);
      }, 3000);
    } else {
      // Switch to next word after erasing
      setIsErasing(false);
      const nextIndex =
        currentIndex === characterTraits.length - 1 ? 0 : currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentTrait(characterTraits[nextIndex]);
    }

    return () => clearTimeout(timeoutId);
  }, [currentIndex, charIndex, currentTrait, isErasing]);

  useEffect(() => {
    if (isSmallScreen) {
      const randomIndex = Math.floor(Math.random() * characterTraits.length);
      setRandomTrait(characterTraits[randomIndex]);
    }
  }, [isSmallScreen]);

  const traitToDisplay = isSmallScreen
    ? randomTrait || ""
    : currentTrait.substring(0, charIndex) + "_";

  // Always append the underscore
  const displayedTrait = traitToDisplay;

  return <span id="trait-styling">{displayedTrait}</span>;
};

export default TraitSwapper;
