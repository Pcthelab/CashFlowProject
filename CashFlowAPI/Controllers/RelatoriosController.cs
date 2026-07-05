using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CashFlowAPI.Models;

namespace CashFlowAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RelatoriosController : ControllerBase
    {
        private readonly DataContext _context;

        public RelatoriosController(DataContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetRelatorioGeral()
        {
            // REQUISITO TÉCNICO: Relatório Consolidado em Tempo Real
            // Lógica que busca todas as pessoas cadastradas incluindo as transações vinculadas (Eager Loading)
            var pessoasDoBanco = await _context.Pessoas
                .Include(p => p.Transacoes)
                .ToListAsync();

            // Lógica de Agregação por Pessoa: Calcula de forma dinâmica os totais de receitas,
            // despesas e o saldo individual com base no tipo de movimentação.
            var relatorioPessoas = pessoasDoBanco.Select(p => {
                var totalReceitas = p.Transacoes.Where(t => t.Tipo == "Receita").Sum(t => t.Valor);
                var totalDespesas = p.Transacoes.Where(t => t.Tipo == "Despesa").Sum(t => t.Valor);

                return new
                {
                    PessoaId = p.Id,
                    Nome = p.Nome,
                    TotalReceitas = totalReceitas,
                    TotalDespesas = totalDespesas,
                    SaldoIndividual = totalReceitas - totalDespesas
                };
            }).ToList();

            // Consolidação Geral do Fluxo de Caixa: Agrupa as métricas de todas as pessoas
            // para gerar os indicadores financeiros agregados da corporação (Saldo Líquido Geral).
            var totalGeralReceitas = relatorioPessoas.Sum(r => r.TotalReceitas);
            var totalGeralDespesas = relatorioPessoas.Sum(r => r.TotalDespesas);
            var saldoLiquidoGeral = totalGeralReceitas - totalGeralDespesas;

            return Ok(new
            {
                PorPessoa = relatorioPessoas,
                TotalGeral = new
                {
                    TotalReceitas = totalGeralReceitas,
                    TotalDespesas = totalGeralDespesas,
                    SaldoLiquidoGeral = saldoLiquidoGeral
                }
            });
        }
    }
}
