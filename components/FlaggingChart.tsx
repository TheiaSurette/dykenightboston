import styles from './FlaggingChart.module.css';

// Colors, wording, and visual row order from the Canva guide.
const flags = [
  { color: 'Black', background: '#191919', ink: '#ffffff', giver: 'Heavy S&M Top', receiver: 'Heavy S&M Bottom' },
  { color: 'Dark Grey', background: '#4c4c4c', ink: '#ffffff', giver: 'Latex Top', receiver: 'Latex Bottom' },
  { color: 'Light Grey', background: '#8a8a8a', ink: '#000000', giver: 'Rigger', receiver: 'Tie Me Up' },
  { color: 'White', background: '#ffffff', ink: '#000000', giver: 'Good With My Hands', receiver: 'Touch Me' },
  { color: 'Beige', background: '#fdda9f', ink: '#000000', giver: 'Rimmer', receiver: 'Eat My Ass' },
  { color: 'Rust', background: '#b85a1d', ink: '#000000', giver: 'Cowpoke', receiver: 'Steed' },
  { color: 'Brown', background: '#844400', ink: '#ffffff', giver: 'Shits', receiver: 'Loves Scat' },
  { color: 'Maroon', background: '#740505', ink: '#ffffff', giver: 'Cuts', receiver: 'Bleeds' },
  { color: 'Red', background: '#cb0000', ink: '#ffffff', giver: 'Fister', receiver: 'Fist Me' },
  { color: 'Coral', background: '#d83a00', ink: '#ffffff', giver: 'Shrimper', receiver: 'Suck My Toes' },
  { color: 'Orange', background: '#f47004', ink: '#000000', giver: 'I’ll Lead the Scene', receiver: 'Down For Anything' },
  { color: 'Peach', background: '#ffa860', ink: '#000000', giver: 'Looking For A Third', receiver: 'Unicorn' },
  { color: 'Yellow', background: '#fdb108', ink: '#000000', giver: 'Golden Shower', receiver: 'Pee On Me' },
  { color: 'Light Yellow', background: '#ffe661', ink: '#000000', giver: 'Spits', receiver: 'Spit On Me' },
  { color: 'Mint Green', background: '#d2ebaa', ink: '#000000', giver: 'Mommy', receiver: 'Looking For Mommy' },
  { color: 'Lime Green', background: '#69ff01', ink: '#000000', giver: 'Take Me Out', receiver: 'Dinner’s On Me' },
  { color: 'Kelly Green', background: '#419f00', ink: '#000000', giver: 'I’m Working', receiver: 'Trick' },
  { color: 'Hunter Green', background: '#274d0c', ink: '#ffffff', giver: 'Daddy', receiver: 'Looking For Daddy' },
  { color: 'Light Blue', background: '#2cbdeb', ink: '#000000', giver: 'Headmaster', receiver: 'Go Down On Me' },
  { color: 'Dark Blue', background: '#045bc2', ink: '#ffffff', giver: 'Assfucker', receiver: 'Fuck My Ass' },
  { color: 'Purple', background: '#7b17eb', ink: '#ffffff', giver: 'Piercer', receiver: 'Pin Cushion' },
  { color: 'Lavender', background: '#b97aff', ink: '#000000', giver: 'Trans', receiver: 'T4T' },
  { color: 'Pink', background: '#ff7af6', ink: '#000000', giver: 'Strap Top', receiver: 'Strap Me Down' },
  { color: 'Magenta', background: '#d80082', ink: '#ffffff', giver: 'Armpit Lover', receiver: 'Suck My Pits' },
];

export default function FlaggingChart() {
  return (
    <div className={styles.chart}>
      <table className={styles.table}>
        <caption className={styles.caption}>Guide to Flagging</caption>
        <thead>
          <tr>
            <th scope="col">Color</th>
            <th scope="col">Left/<wbr />Giver</th>
            <th scope="col">Right/<wbr />Receiver</th>
          </tr>
        </thead>
        <tbody>
          {flags.map(({ color, background, ink, giver, receiver }) => (
            <tr key={color} style={{ backgroundColor: background, color: ink }}>
              <th scope="row">{color}</th>
              <td>{giver}</td>
              <td>{receiver}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
