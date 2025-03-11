const vm = new Vue({
  el: "#app",
  data: {
    produtos: [],
    produto: false,
    carrinho: [],
    carrinhoAtivo: false,
    mensagemAlerta: "Item adicionado",
    alertaAtivo: false,
  },
  filters: {
    numPreco(value) {
      return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    },
  },
  computed: {
    // Essa propriedade é computed, porque ela vai mudar de acordo com o total de itens e o preço de cada um deles.
    carrinhoTotal() {
      let total = 0;
      // Verificando se existem itens no carrinho para percorrer eles e fazer a somatória de preços ao total.
      if (this.carrinho.length) {
        this.carrinho.forEach((item) => {
          total += item.preco;
        });
      }
      return total;
    },
  },
  methods: {
    // Função fetch GET principal para listar todos os produtos.
    fetchProdutos() {
      fetch("./api/produtos.json")
        .then((r) => r.json())
        .then((r) => {
          this.produtos = r;
        });
    },

    // Função fetch GET para obter os dados específicos de determinado produto.
    fetchProduto(id) {
      fetch(`./api/produtos/${id}/dados.json`)
        .then((r) => r.json())
        .then((r) => {
          this.produto = r;
        });
    },

    // Função de abrir o modal, se baseando na função fetchProduto e adicionando um scroll para o topo suave ao abrir.
    openModal(id) {
      this.fetchProduto(id);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },

    // Função de fechar modal, se baseando no target e currentTarget, para fechar quando clicar fora do modal.
    closeModal({ target, currentTarget }) {
      if (target === currentTarget) this.produto = false;
    },

    // Função de fechar modal do carrinho, se baseando no target e currentTarget, para fechar quando clicar fora do modal.
    closeCartModal({ target, currentTarget }) {
      if (target === currentTarget) this.carrinhoAtivo = false;
    },

    // Função de adicionar item ao carrinho.
    addItem() {
      this.produto.estoque--;
      const { id, nome, preco } = this.produto; // Desestruturando o objeto Produto.
      this.carrinho.push({ id, nome, preco });
      this.alerta(`${nome} adicionado ao carrinho`);
    },

    // Função para remover item do carrinho.
    removeItem(index) {
      this.carrinho.splice(index, 1); // Método splice leva 2 argumentos: De onde começa a remover o item e até quantos itens vão ser removidos.
    },

    // Verificação de contéudo dentro do localStorage para popular o carrinho.
    checkLocalStorage() {
      if (window.localStorage.carrinho) {
        this.carrinho = JSON.parse(window.localStorage.carrinho); // Transformando a string de volta em array para a propriedade carrinho.
      }
    },

    // Função para verificar o tamanho do estoque.
    compareStorage() {
      const items = this.carrinho.filter(({id}) => { // Filtrando o quantidade de cada item do carrinho.
        if (id === this.produto.id)    // Comparando o item clicado com os itens do carrinho.
        return true;
      });
      this.produto.estoque -= items.length; // Removendo os produtos adicionados no carrinho do estoque.
    },

    // Função de alerta
    alerta(mensagem) {
      this.mensagemAlerta = mensagem;
      this.alertaAtivo = true;
      setTimeout(() => {
        this.alertaAtivo = false;
      }, 1500);
    },

    // Método para realização do roteamento.
    router() {
      const hash = document.location.hash; // Pegando o valor do hash do documento.
      if (hash) {
        this.fetchProduto(hash.replace("#", "")); // Substituindo o # por vazio para não buscar o id como #id.
      }
    },
  },
  // Watch para observar modificação no carrinho e adicionar no localStorage.
  watch: {
    produto() {
      document.title = this.produto.nome || "Techno";
      const hash = this.produto.id || "";
      history.pushState(null, null, `#${hash}`); // Utilizando para modificar a URL.

      if (this.produto) {
        this.compareStorage();
      }
    },
    carrinho() {
      window.localStorage.carrinho = JSON.stringify(this.carrinho); // Transformando em string para não salvar como [object Object]
    },
  },
  created() {
    this.fetchProdutos();
    this.router();
    this.checkLocalStorage();
  },
});
