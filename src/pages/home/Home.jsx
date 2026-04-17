import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Post from "../../components/post/Post";
import s from "./Home.module.scss";
import api from "../../services/api";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  //Listar postagens

  useEffect(()=>{
    async function carregarPosts() {
      try {
        const res = await api.get("/posts")
        setPosts(res.data);
      } catch(error) {
        console.log("Erro ao carregar posts" + error)
      }
    }
    carregarPosts();
  }, [])

  // Editar ou criar uma nova postagem
  
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (editandoId) {
        await api.put(`/posts/${editandoId}`, {
          titulo,
          conteudo,
        })
        setEditandoId(null);
      } else {
        await api.post("/posts", {titulo, conteudo})
      }

      const res = await api.get("/posts");
      setPosts(res.data)

      setTitulo("");
      setConteudo("")
    } catch (error) {
      console.log("Error ao salvar a postagem" + error)
    }
  } 

  // Iniciar a edição

  function handleEdit(post) {
    setTitulo(post.titulo);
    setConteudo(post.conteudo);
    setEditandoId(post.post_id);
  }

  // Deletar postagens

  async function handleDelete(id) {
    const confirmacao = confirm("Tem certeza que deseja deletar este post?")
    if (!confirmacao) return;

    try {
      await api.delete(`/posts/${id}`)
      setPosts((prev) => prev.filter((post) => post.post_id !== id))
    } catch (error) {
      console.log("Erro ao deletar a postagem" + error)
    }
  }
  
  function handleLogout() {
    logout();          // remove token
    navigate("/login"); // redireciona
  }

  return (
    <>
      <div className={s.home}>
        <h1>Feed</h1>
        <button className={s.btn} onClick={handleLogout}>
          Sair
        </button>
      </div>
      {/* FORM DE POSTAGEM */}
        <form className={s.postForm} onSubmit={handleSubmit}>
          <input
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <textarea
            placeholder="O que você está pensando?"
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
          />

          <button type="submit">{editandoId ? "Atualizar Post" : "Postar"}</button>

          {editandoId && (
            <button
              type="button"
              className="cancel"
              onClick={() => {
                setEditandoId(null);
                setTitulo("");
                setConteudo("");
              }}
            >
              Cancelar
            </button>
          )}
        </form>

        {/* LISTA DE POSTS */}
        <div className={s.postsContainer}>
          {posts.length === 0 ? (
            <p className={s.empty}>Nenhum post ainda...</p>
          ) : (
            posts.map((post) => (
              <Post key={post.post_id} post={post} onEdit={handleEdit} onDelete={handleDelete}/>
            ))
          )}
        </div>
    </>
  );
}