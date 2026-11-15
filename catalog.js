// Shared by the Design-your-own and Create-your-own pages.

// ---- catalog: the "Design Your Own 3D Print" product in Wix ------------------------------------
// Variant ids and prices come from that product. If a price changes in the Wix dashboard,
// change it here too (the cart always charges the Wix price).
export const PRODUCT_ID = "1926535d-34f1-4e37-b695-87f22613a3c7";
export const VARIANTS = {
  tag:     { Small: ["72100d27-4718-4997-8cde-d96bc2900ab4", 10], Medium: ["475341e2-f485-4b14-baba-e5d29d716b51", 11], Large: ["177b5841-562b-426e-b67b-2d3e9aeb6643", 13] },
  star:    { Small: ["0a28da68-c731-4805-b4a0-46e89df803ec", 11], Medium: ["85f489f9-9901-4a8f-81fc-ec17cffce6ca", 13], Large: ["d514d49f-8564-47ae-8997-bb8a2852b8a1", 16] },
  heart:   { Small: ["85f68d66-39d4-4256-997e-75a7f0fac5c2", 11], Medium: ["606115d1-276f-49bf-b8f8-090a31831a02", 13], Large: ["8a79f5e7-5329-4225-ab89-0113e315ee8c", 16] },
  spinner: { Small: ["00a0b7d1-adeb-40d3-8dc0-f3da97a23de0", 12], Medium: ["50bf1dca-1671-4293-a7c0-58776ced43db", 14], Large: ["6b312cb1-c602-4743-bed4-ea534f9084e4", 19] },
  plate:   { Small: ["b2a12f99-c19b-4e7a-8295-baf9b2bd44d4", 13], Medium: ["4fc549ba-3365-42cf-b45d-a1b61ef53d81", 15], Large: ["e8d8e8fa-b148-4034-86ac-657bcd8cd062", 21] },
  egg:     { Small: ["2e7902c5-03fb-4d46-9124-ab132fcec262", 12], Medium: ["4bee8d69-d91d-4148-b79b-a2712943bb65", 15], Large: ["ed488b00-5bab-43e0-a8ae-d4e8a6aa2cc4", 20] },
  letter:  { Small: ["4763b8ed-71c2-4131-80f8-0e2b8cc53690", 20], Medium: ["3162d675-fb15-4795-929f-1faa98772788", 25], Large: ["f7d79cf4-4b3f-48fe-86fa-193031a7b4f8", 32] },
  spike:   { Small: ["de5e2cff-9110-4a3c-9e26-a8cd7c753cac", 14], Medium: ["f2ed534a-8fcc-40cc-a11d-b994914928ee", 18], Large: ["ded634ca-0fe3-46b9-b340-45a688824ddd", 25] },
  organizer: { Small: ["5b2a37b5-a3ca-4fc8-a9c8-31ebb08c9ca4", 22], Medium: ["143b661d-3d98-4f8b-a308-f5359f1f0208", 28], Large: ["453d350d-627d-419c-92c3-889c98940277", 36] },
};

// Medium-size plastic (g) and print time (h); the prices above were worked out from these.
// `photo` is a print of that shape, shown next to the 3D preview; `credit` names a design that isn't ours
// (its licence asks us to credit the designer and link the model wherever we sell it).
export const SHAPES = [
  { key: "tag", name: "Keychain tag", grams: 8, hours: 0.7, icon: "M5 7h14a4 4 0 0 1 0 10H5a4 4 0 0 1 0-8zm1 3.2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6z" },
  { key: "star", name: "Star", grams: 18, hours: 1.2, icon: "M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 21l1.6-7L2 9.2l7.1-.6z" },
  { key: "heart", name: "Heart", grams: 18, hours: 1.2, icon: "M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z" },
  { key: "spinner", name: "Fidget spinner", grams: 30, hours: 2, icon: "M12 2a4 4 0 0 1 2 7.5V10a3 3 0 0 1 1 1.3 4 4 0 1 1-1.6 3.6 3 3 0 0 1-2.8 0A4 4 0 1 1 9 11.3a3 3 0 0 1 1-1.3v-.5A4 4 0 0 1 12 2z" },
  { key: "plate", name: "Name plate", grams: 35, hours: 2.5, icon: "M3 8h18a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zm3 3v2h12v-2z" },
  { key: "egg", name: "Dragon egg", grams: 40, hours: 4, photo: "https://static.wixstatic.com/media/67b3a8_437f5fb57869465f8270393cfb940de0~mv2.jpg", icon: "M12 2c3.9 0 7 6.2 7 11.2A7 7 0 0 1 5 13.2C5 8.2 8.1 2 12 2zM8 20h8v2H8z" },
  { key: "spike", name: "Spike dragon", grams: 45, hours: 5, photo: "https://static.wixstatic.com/media/67b3a8_29173b54f7004792997352465bdaf42c~mv2.jpg/v1/fill/w_400,h_400,al_c,q_85/spike-dragon.jpg",
    credit: { by: "CLUCKWORKS 3D", profile: "https://makerworld.com/en/@CHICKEMM", model: "https://makerworld.com/en/models/1670898-articulated-spike-dragon-free-to-sell-read-desc", licence: "CC BY-SA 4.0" },
    icon: "M1 15l3-5 2 3 2-5 2 5 2-5 2 5 2-5 2 5 3-3 2 2-3 4H4z" },
  { key: "letter", name: "Name letter", grams: 60, hours: 4, photo: "https://static.wixstatic.com/media/67b3a8_6ca34f89df514fa391d50ba0678b32fb~mv2.jpg", icon: "M10 2h4l7 20h-4.2l-1.5-4.5H8.7L7.2 22H3zm-.1 12h4.2L12 7.6z" },
  { key: "organizer", name: "Desk organizer", grams: 90, hours: 6, photo: "https://static.wixstatic.com/media/67b3a8_bc684720a26c450f8fc7eaa47ddd673c~mv2.jpg", icon: "M2 8h20v13H2zm2 2v9h5v-9zm7 0v9h2v-9zm4 0v9h5v-9z" },
];
export const SIZES = [
  { name: "Small", scale: 0.7, grams: 0.55, hours: 0.6 },
  { name: "Medium", scale: 1, grams: 1, hours: 1 },
  { name: "Large", scale: 1.4, grams: 2.2, hours: 1.8 },
];
export const COLOURS = [
  { name: "Galaxy purple", hex: "#7b4dff" },
  { name: "Neon green", hex: "#39ff14" },
  { name: "Sky blue", hex: "#00b3ff" },
  { name: "Sunny yellow", hex: "#ffd23f" },
  { name: "Hot pink", hex: "#ff4fa3" },
  { name: "Fire orange", hex: "#ff7a1a" },
  { name: "Silver", hex: "#c0c2cc" },
  { name: "Snow white", hex: "#f4f4f8" },
  { name: "Midnight black", hex: "#25232f" },
  { name: "Glow in the dark", hex: "#c8ffb0", glow: true },
];
