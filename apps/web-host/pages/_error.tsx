function Error({ statusCode }: { statusCode: number }) {
  return (
    <p>
      {statusCode
        ? `Ocorreu um erro no servidor: ${statusCode}`
        : 'Ocorreu um erro no cliente'}
    </p>
  );
}

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error; 