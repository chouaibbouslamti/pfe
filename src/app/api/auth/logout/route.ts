import { NextResponse } from 'next/server';

export async function POST() {
  // Dans une application réelle, ici vous pourriez :
  // - Invalider les jetons JWT
  // - Supprimer les cookies de session
  // - Effectuer des nettoyages côté serveur

  try {
    // Création d'une réponse qui pourrait inclure la suppression de cookies
    const response = NextResponse.json(
      { success: true, message: 'Déconnexion réussie' },
      { status: 200 }
    );
    
    // Si vous utilisez des cookies pour l'authentification, supprimez-les ici
    // response.cookies.delete('token');
    
    return response;
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return NextResponse.json(
      { success: false, error: 'Échec de la déconnexion' },
      { status: 500 }
    );
  }
}
