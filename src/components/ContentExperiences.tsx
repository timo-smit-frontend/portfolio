import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import EXPERIENCES from '../data/Experiences.js'

export default function ContentExperiences() {
  const [openIndex, setOpenIndex] = useState(0)

  const handleToggle = (index: number) => {
    if (openIndex !== index) {
      setOpenIndex(index)
    }
  }

  return (
    <section className="section flex flex-col items-center">
      <div className="container">
        <div className="flex flex-col items-center gap-8">
          <h2 className="lg:text-4xl text-3xl font-bold">
            My <span>professional</span> front-end experiences
          </h2>
          <ul className="flex flex-col gap-8 max-w-190">
            {EXPERIENCES.map((listItem, index) => (
              <li key={index} className="border border-[var(--white)] rounded list-none">
                <button
                  className={`w-full pr-8 font-semibold flex items-center justify-between smooth ${
                    openIndex === index ? 'cursor-normal border-b border-white' : 'cursor-pointer hover:bg-white/20'
                  }`}
                  onClick={() => handleToggle(index)}
                  aria-expanded={openIndex === index}
                  tabIndex={0}
                  type="button"
                >
                  <div className="flex items-center gap-4">
                    <img className="bg-white object-contain w-40 h-24 p-4" src={listItem.image} alt={listItem.title} />
                    <h3>{listItem.title}</h3>
                  </div>
                  <span className="text-[var(--white)] text-xl">{openIndex === index ? '-' : '+'}</span>
                </button>
                <AnimatePresence initial={false}>
                  {openIndex === index && (
                    <motion.div
                      key="content"
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden p-4"
                    >
                      <p>{listItem.description}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
