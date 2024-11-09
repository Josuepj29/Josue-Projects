package veterinaria.ui;

import javax.swing.*;
import java.awt.*;
import java.util.ArrayList;
import java.util.List;

public class ServicioBanos extends JFrame {
    private JButton btnRegistroBano;
    private JButton btnListadoBanos;
    private JButton btnSalaBanos;
    private List<String> mascotasRegistradas; // Lista para almacenar las mascotas registradas

    public ServicioBanos() {
        setTitle("Servicio de Baños");
        setSize(400, 300);
        setLayout(new GridLayout(3, 1, 10, 10));
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        // Inicializar la lista de mascotas registradas
        mascotasRegistradas = new ArrayList<>();

        // Crear y agregar los botones
        btnRegistroBano = new JButton("Registro de Baño");
        btnListadoBanos = new JButton("Listado de Baños");
        btnSalaBanos = new JButton("Sala de Baños");

        // Acción para abrir la ventana RegistroBano
        btnRegistroBano.addActionListener(e -> {
            RegistroBano ventanaRegistro = new RegistroBano(mascotasRegistradas);
            ventanaRegistro.setVisible(true);
        });

        // Acción para abrir la ventana ListadoBanos
        btnListadoBanos.addActionListener(e -> {
            ListadoBanos ventanaListado = new ListadoBanos(mascotasRegistradas);
            ventanaListado.setVisible(true);
        });

        // Acción para abrir la ventana SalaDeBanos
        btnSalaBanos.addActionListener(e -> {
            // Aquí se pasa la lista de mascotas procesadas
            List<SalaDeBanos.MascotaInfo> mascotasEnSala = new ArrayList<>();
            // Agregar las mascotas a la sala de baños con los 7 parámetros requeridos
            mascotasEnSala.add(new SalaDeBanos.MascotaInfo("Firulais", "Juan Pérez", "12/01/2024 10:00 AM", "$50", "$10", "$40", "En Proceso"));
            mascotasEnSala.add(new SalaDeBanos.MascotaInfo("Misi", "Juan Pérez", "12/01/2024 10:30 AM", "$30", "$5", "$25", "En Proceso"));
            // Abre la ventana SalaDeBanos con las mascotas procesadas
            new SalaDeBanos(mascotasEnSala).setVisible(true);
        });

        // Agregar los botones al panel
        add(btnRegistroBano);
        add(btnListadoBanos);
        add(btnSalaBanos);
    }

    public static void main(String[] args) {
        ServicioBanos ventana = new ServicioBanos();
        ventana.setVisible(true);
    }
}
