using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CashFlowAPI.Models;

namespace CashFlowAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransacoesController : ControllerBase
    {
        private readonly DataContext _context;

        public TransacoesController(DataContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transacao>>> GetTransacoes()
        {
            return await _context.Transacoes.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Transacao>> PostTransacao(Transacao transacao)
        {
            var pessoa = await _context.Pessoas.FindAsync(transacao.PessoaId);
            if (pessoa == null)
            {
                return BadRequest("Regra de Negócio: A pessoa informada não existe no cadastro.");
            }

            if (transacao.Tipo != "Despesa" && transacao.Tipo != "Receita")
            {
                return BadRequest("O tipo da transação deve ser estritamente 'Despesa' ou 'Receita'.");
            }

            if (pessoa.Idade < 18 && transacao.Tipo == "Receita")
            {
                return BadRequest("Regra de Negócio: Usuários menores de 18 anos SÓ podem cadastrar transações do tipo 'Despesa'.");
            }

            _context.Transacoes.Add(transacao);
            await _context.SaveChangesAsync();

            return Ok(transacao);
        }
    }
}