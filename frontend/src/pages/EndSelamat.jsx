import logo from "../assets/logoKomdigiKlaten.png";


const Form = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-center" style={{
    backgroundImage: "url(https://static.promediateknologi.id/crop/0x0:0x0/0x0/webp/photo/p2/222/2024/07/30/WhatsApp-Image-2024-07-29-at-231057-2532557899.jpeg)",
  }}>
      <div className="backdrop-blur-sm w-full max-w-md p-6 shadow-2xl rounded-lg">
        <div className="flex flex-col items-center">
          <img src={logo} alt="Logo Diskominfo" className="h-16 mb-4" />
          <h1 className="text-xl font-bold text-center text-white">TERIMA KASIH</h1>
          <h1 className="text-xl font-bold text-center text-white">TELAH MENGISI</h1>
          <h1 className="text-xl font-bold text-center text-white">BUKU TAMU</h1>
        </div>
      </div>
    </div>
  );
};

export default Form;
