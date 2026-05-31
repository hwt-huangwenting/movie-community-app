import React from 'react';

function Footer() {
  return (
    <footer style={{
      backgroundColor: '#141414',
      color: '#808080',
      textAlign: 'center',
      padding: '20px 0',
      marginTop: '40px',
      borderTop: '1px solid #333'
    }}>
      <p>© {new Date().getFullYear()} 电影展示网站</p>
    </footer>
  );
}

export default Footer;