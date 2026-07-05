using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CashFlowAPI.Models;

namespace CashFlowAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PessoasController : ControllerBase
    {
        private readonly DataContext _context;

        public PessoasController(DataContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pessoa>>> GetPessoas()
        {
            return await _context.Pessoas.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Pessoa>> PostPessoa(Pessoa pessoa)
        {
            _context.Pessoas.Add(pessoa);
            await _context.SaveChangesAsync();

            return Ok(pessoa);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePessoa(string id)
        {
            if (!Guid.TryParse(id, out Guid pessoaGuid))
            {
                return BadRequest("O ID enviado está em um formato inválido.");
            }

            var pessoa = await _context.Pessoas
                .Include(p => p.Transacoes)
                .FirstOrDefaultAsync(p => p.Id == pessoaGuid);

            if (pessoa == null)
            {
                return NotFound("Pessoa não encontrada.");
            }

            if (pessoa.Transacoes != null && pessoa.Transacoes.Any())
            {
                _context.Transacoes.RemoveRange(pessoa.Transacoes);
            }

            _context.Pessoas.Remove(pessoa);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}