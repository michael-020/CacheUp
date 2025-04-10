export const routeVariants = {
    initial: {
        y: 0.9,
        opacity: 0,
    },
    final: {
        y: 1,
        opacity: 1,
        transition: {
          duration: 0.8,
          type: "spring",
          ease: "easeInOut"
        }
    },
    exit: {
      scale:0.9,
      opacity:0
    }
}