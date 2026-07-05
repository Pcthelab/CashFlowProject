using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace CashFlowAPI.Models
{
    public class Transacao
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string Descricao { get; set; } = string.Empty;

        [Required]
        public decimal Valor { get; set; }

        [Required]
        public string Tipo { get; set; } = "Despesa"; 

        [Required]
        public Guid PessoaId { get; set; }

        [ForeignKey("PessoaId")]
        [JsonIgnore] 
        public Pessoa? Pessoa { get; set; }
    }
}