def calcular_media():
    print("=== Calculadora de Média de Notas ===")
    print("Digite as notas separadas por espaço (ex: 8.5 7.0 9.5)")
    
    try:
        entrada = input("Notas: ")
        # Separa a string por espaços e converte cada parte para float
        # Substitui vírgula por ponto para aceitar formatos como 7,5
        notas = [float(x.replace(',', '.')) for x in entrada.split()]
        
        if not notas:
            print("Nenhuma nota foi inserida.")
            return

        quantidade = len(notas)
        soma = sum(notas)
        media = soma / quantidade

        print("\n--- Resultados ---")
        print(f"Quantidade de notas: {quantidade}")
        print(f"Soma das notas: {soma:.2f}")
        print(f"Média final: {media:.2f}")
        
        # Feedback simples sobre a média
        if media >= 7.0:
            print("Situação: Aprovado (Média >= 7.0)")
        else:
            print("Situação: Abaixo da média (Média < 7.0)")

    except ValueError:
        print("Erro: Certifique-se de digitar apenas números separados por espaço.")

if __name__ == "__main__":
    calcular_media()
