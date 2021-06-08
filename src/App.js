import React, { useState } from "react";
import { useSprings, animated, interpolate } from "react-spring";
import { useGesture } from "react-use-gesture";
import "./App.css";

const cards = [
    {
        image: "https://images.unsplash.com/photo-1453791052107-5c843da62d97?ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDEwfDZzTVZqVExTa2VRfHxlbnwwfHx8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        width: 576,
        height: 384,
    },
    {
        image: "https://images.unsplash.com/photo-1499510318569-1a3d67dc3976?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
        width: 219,
        height: 274,
    },
    {
        image: "https://images.unsplash.com/photo-1622795346484-bc6f19a3428d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
        width: 600,
        height: 400,
    },
    {
        image: "https://images.unsplash.com/photo-1453791052107-5c843da62d97?ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDEwfDZzTVZqVExTa2VRfHxlbnwwfHx8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        width: 576,
        height: 384,
    },
    {
        image: "https://images.unsplash.com/photo-1591995973992-26c779cf152e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
        width: 400,
        height: 600,
    },
    {
        image: "https://images.unsplash.com/photo-1453791052107-5c843da62d97?ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDEwfDZzTVZqVExTa2VRfHxlbnwwfHx8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        width: 576,
        height: 384,
    },
];

// These two are just helpers, they curate spring data, values that are later being interpolated into css
const to = (i) => ({
    x: 0,
    y: i * -4,
    scale: 1,
    rot: -10 + Math.random() * 20,
    delay: i * 100,
});
const from = (i) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });
// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r, s) =>
    `perspective(1500px) rotateX(30deg) rotateY(${
        r / 10
    }deg) rotateZ(${r}deg) scale(${s})`;

function App() {
    const [gone] = useState(() => new Set()); // The set flags all the cards that are flicked out
    const [props, set] = useSprings(cards.length, (i) => ({
        ...to(i),
        from: from(i),
    })); // Create a bunch of springs using the helpers above
    // Create a gesture, we're interested in down-state, delta (current-pos - click-pos), direction and velocity
    const bind = useGesture(
        ({
            args: [index],
            down,
            delta: [xDelta],
            distance,
            direction: [xDir],
            velocity,
        }) => {
            const trigger = velocity > 0.2; // If you flick hard enough it should trigger the card to fly out
            const dir = xDir < 0 ? -1 : 1; // Direction should either point left or right
            if (!down && trigger) gone.add(index); // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
            set((i) => {
                if (index !== i) return; // We're only interested in changing spring-data for the current spring
                const isGone = gone.has(index);
                const x = isGone
                    ? (200 + window.innerWidth) * dir
                    : down
                    ? xDelta
                    : 0; // When a card is gone it flys out left or right, otherwise goes back to zero
                const rot = xDelta / 100 + (isGone ? dir * 10 * velocity : 0); // How much the card tilts, flicking it harder makes it rotate faster
                const scale = down ? 1.1 : 1; // Active cards lift up a bit
                return {
                    x,
                    rot,
                    scale,
                    delay: undefined,
                    config: {
                        friction: 50,
                        tension: down ? 800 : isGone ? 200 : 500,
                    },
                };
            });
            if (!down && gone.size === cards.length)
                setTimeout(() => gone.clear() || set((i) => to(i)), 600);
        }
    );
    return props.map(({ x, y, rot, scale }, i) => (
        <animated.div
            key={i}
            style={{
                transform: interpolate(
                    [x, y],
                    (x, y) => `translate3d(${x}px, ${y}px, 0)`
                ),
            }}
        >
            <animated.div
                {...bind(i)}
                style={{
                    transform: interpolate([rot, scale], trans),
                    backgroundImage: `url(${cards[i].image})`,
                    width: cards[i].width,
                    height: cards[i].height,
                }}
            />
        </animated.div>
    ));
}

export default App;
